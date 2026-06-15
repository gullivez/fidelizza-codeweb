import { Injectable } from '@nestjs/common';
import type { IntegrationCredentials, RawOrder } from './integration.adapter';
import { IntegrationAdapter } from './integration.adapter';

@Injectable()
export class MockAnotaAiAdapter extends IntegrationAdapter {
  fetchOrders(_credentials: IntegrationCredentials, date: Date): Promise<RawOrder[]> {
    const day = date.toISOString().slice(0, 10);

    const orders: RawOrder[] = [
      {
        externalId: `mock-order-001-${day}`,
        orderedAt: new Date(`${day}T12:30:00Z`),
        status: 'delivered',
        totalAmount: 58.9,
        customer: {
          externalId: 'mock-customer-001',
          name: 'João da Silva',
          phone: '+5543999990001',
        },
        items: [
          { externalId: 'item-001', name: 'X-Burguer', quantity: 2, unitPrice: 22.0, totalPrice: 44.0 },
          { externalId: 'item-002', name: 'Suco Laranja', quantity: 1, unitPrice: 14.9, totalPrice: 14.9 },
        ],
      },
      {
        externalId: `mock-order-002-${day}`,
        orderedAt: new Date(`${day}T14:00:00Z`),
        status: 'delivered',
        totalAmount: 32.5,
        customer: {
          externalId: 'mock-customer-001',
          name: 'João da Silva',
          phone: '+5543999990001',
        },
        items: [
          { externalId: 'item-003', name: 'Combo Frango', quantity: 1, unitPrice: 32.5, totalPrice: 32.5 },
        ],
      },
      {
        externalId: `mock-order-003-${day}`,
        orderedAt: new Date(`${day}T19:45:00Z`),
        status: 'delivered',
        totalAmount: 45.0,
        customer: {
          externalId: 'mock-customer-002',
          name: 'Maria Oliveira',
          phone: '+5543999990002',
        },
        items: [
          { externalId: 'item-004', name: 'Pizza Mussarela M', quantity: 1, unitPrice: 45.0, totalPrice: 45.0 },
        ],
      },
    ];

    return Promise.resolve(orders);
  }
}
