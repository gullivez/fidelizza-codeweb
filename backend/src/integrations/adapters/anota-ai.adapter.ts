import { Injectable, Logger } from '@nestjs/common';
import type { IntegrationCredentials, RawOrder, RawOrderItem } from './integration.adapter';
import { IntegrationAdapter } from './integration.adapter';

const STATUS_MAP: Record<number, string> = {
  0: 'pending',
  1: 'confirmed',
  2: 'ready',
  3: 'delivered',
  4: 'cancelled',
  5: 'cancelled',
};

const API_BASE = 'https://api-parceiros.anota.ai/partnerauth/ping/list';

@Injectable()
export class AnotaAiAdapter extends IntegrationAdapter {
  private readonly logger = new Logger(AnotaAiAdapter.name);

  async fetchOrders(credentials: IntegrationCredentials, date: Date): Promise<RawOrder[]> {
    const token = credentials.clientSecret;
    const dateStr = date.toISOString().slice(0, 10);
    const orders: RawOrder[] = [];
    let currentPage = 1;
    let fetched = 0;
    let total = Infinity;

    while (fetched < total) {
      const url = new URL(API_BASE);
      url.searchParams.set('excludeIfood', '1');
      url.searchParams.set('date', dateStr);
      url.searchParams.set('currentpage', String(currentPage));
      url.searchParams.set('limit', '100');

      const res = await fetch(url.toString(), {
        headers: {
          Authorization: token,
          'Content-Type': 'application/json',
        },
      });

      if (!res.ok) {
        throw new Error(`Anota.ai API error: ${res.status} ${res.statusText}`);
      }

      const body = await res.json() as { info: { count: number }; data: unknown[] };
      total = body.info?.count ?? 0;

      if (!body.data?.length) break;

      for (const raw of body.data as Record<string, unknown>[]) {
        orders.push(this.mapOrder(raw));
      }

      fetched += body.data.length;
      currentPage++;
    }

    this.logger.debug(`fetchOrders: fetched ${orders.length} orders for ${dateStr}`);
    return orders;
  }

  private mapOrder(raw: Record<string, unknown>): RawOrder {
    const customer = raw['client'] as Record<string, unknown>;
    const items = (raw['cart'] as Record<string, unknown>[]) ?? [];

    const rawPhone = String(customer?.['phone'] ?? '').replace(/\D/g, '');
    const phone = rawPhone.startsWith('55') ? `+${rawPhone}` : `+55${rawPhone}`;

    return {
      externalId: String(raw['_id']),
      orderedAt: new Date(raw['createdAt'] as string),
      status: STATUS_MAP[Number(raw['check'])] ?? 'pending',
      totalAmount: Number(raw['totalPrice'] ?? 0),
      customer: {
        externalId: String(customer?.['_id'] ?? ''),
        name: String(customer?.['name'] ?? 'Cliente'),
        phone,
      },
      items: items.map((item) => ({
        externalId: String(item['_id'] ?? ''),
        name: String(item['name'] ?? ''),
        quantity: Number(item['quantity'] ?? 1),
        unitPrice: Number(item['price'] ?? 0),
        totalPrice: Number(item['totalPrice'] ?? 0),
      } satisfies RawOrderItem)),
    };
  }
}
