import { Injectable, Logger } from '@nestjs/common';
import type {
  IntegrationCredentials,
  RawOrder,
  RawOrderItem,
} from './integration.adapter';
import { IntegrationAdapter } from './integration.adapter';

const STATUS_MAP: Record<number, string> = {
  0: 'pending',
  1: 'confirmed',
  2: 'ready',
  3: 'delivered',
  4: 'cancelled',
  5: 'cancelled',
};

const API_BASE = 'https://api-parceiros.anota.ai/partnerauth/ping';

interface AnotaAiListResponse {
  success: boolean;
  info: {
    docs: Array<{ _id: string }>;
    count: number;
    limit: number;
    currentpage: number;
  };
}

interface AnotaAiDetailResponse {
  success: boolean;
  info: Record<string, unknown>;
}

@Injectable()
export class AnotaAiAdapter extends IntegrationAdapter {
  private readonly logger = new Logger(AnotaAiAdapter.name);

  async fetchOrders(
    credentials: IntegrationCredentials,
    date: Date,
  ): Promise<RawOrder[]> {
    const token = credentials.clientSecret;
    const dateStr = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}-${String(date.getDate()).padStart(2, '0')}`;

    // Passo 1: coletar IDs paginados de /ping/list
    const ids: string[] = [];
    let currentPage = 1;
    let fetched = 0;
    let total = Infinity;

    while (fetched < total) {
      const url = new URL(`${API_BASE}/list`);
      url.searchParams.set('excludeIfood', '1');
      url.searchParams.set('date', dateStr);
      // TODO: validar parâmetro correto com credencial real — pode ser 'store', 'storeId', ou header
      url.searchParams.set('storeId', credentials.clientId);
      url.searchParams.set('currentpage', String(currentPage));
      url.searchParams.set('limit', '100');

      const res = await fetch(url.toString(), {
        headers: { Authorization: token, 'Content-Type': 'application/json' },
      });

      if (!res.ok) {
        throw new Error(
          `Anota.ai /ping/list error: ${res.status} ${res.statusText}`,
        );
      }

      const body = (await res.json()) as AnotaAiListResponse;
      total = body.info?.count ?? 0;

      if (!body.info?.docs?.length) break;

      for (const doc of body.info.docs) {
        if (doc._id) ids.push(doc._id);
      }

      fetched += body.info.docs.length;
      currentPage++;
    }

    this.logger.debug(
      `fetchOrders: found ${ids.length} order IDs for ${dateStr}`,
    );

    // Passo 2: buscar detalhe de cada pedido em paralelo
    const results = await Promise.allSettled(
      ids.map((id) => this.fetchOrderDetail(token, id)),
    );

    // Passo 3: filtrar nulos (anônimos) e falhas individuais
    const orders: RawOrder[] = [];
    for (const result of results) {
      if (result.status === 'fulfilled' && result.value !== null) {
        orders.push(result.value);
      } else if (result.status === 'rejected') {
        this.logger.warn(
          `Failed to fetch order detail: ${String(result.reason)}`,
        );
      }
    }

    this.logger.debug(
      `fetchOrders: returning ${orders.length} valid orders for ${dateStr}`,
    );
    return orders;
  }

  private async fetchOrderDetail(
    token: string,
    orderId: string,
  ): Promise<RawOrder | null> {
    const res = await fetch(`${API_BASE}/get/${orderId}`, {
      headers: { Authorization: token, 'Content-Type': 'application/json' },
    });

    if (!res.ok) {
      throw new Error(
        `Anota.ai GET order ${orderId}: ${res.status} ${res.statusText}`,
      );
    }

    const body = (await res.json()) as AnotaAiDetailResponse;
    const info = body.info;
    const customer = (info['customer'] ?? null) as Record<
      string,
      unknown
    > | null;

    const rawPhone = String((customer?.['phone'] as string) ?? '').replace(
      /\D/g,
      '',
    );

    // Phone inválido: vazio, só zeros, ou menos de 10 dígitos
    const isInvalidPhone =
      !rawPhone || rawPhone.length < 10 || /^0+$/.test(rawPhone);
    if (isInvalidPhone) {
      this.logger.debug(
        `fetchOrderDetail: skipping order ${orderId} — invalid phone "${rawPhone}"`,
      );
      return null;
    }

    const phone = rawPhone.startsWith('55') ? `+${rawPhone}` : `+55${rawPhone}`;

    const items = (
      (info['items'] as Record<string, unknown>[] | null) ?? []
    ).filter(Boolean);

    return {
      externalId: String((info['_id'] as string) ?? orderId),
      orderedAt: info['createdAt']
        ? new Date(info['createdAt'] as string)
        : new Date(),
      status: STATUS_MAP[Number(info['check'] ?? -1)] ?? 'pending',
      totalAmount: Number(info['total'] ?? 0),
      customer: {
        externalId: String((customer?.['id'] as string) ?? ''),
        name: String((customer?.['name'] as string) ?? 'Cliente'),
        phone,
      },
      items: items.map(
        (item) =>
          ({
            externalId: String((item['externalId'] as string) ?? ''),
            name: String((item['name'] as string) ?? ''),
            quantity: Number(item['quantity'] ?? 1),
            unitPrice: Number(item['price'] ?? 0),
            totalPrice: Number(item['total'] ?? 0),
          }) satisfies RawOrderItem,
      ),
    };
  }
}
