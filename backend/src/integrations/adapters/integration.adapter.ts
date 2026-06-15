export interface RawOrderItem {
  externalId: string;
  name: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface RawOrderCustomer {
  externalId: string;
  name: string;
  /** Phone in E.164 format (+5511999990001). Conversion is the adapter's responsibility. */
  phone: string;
}

export interface RawOrder {
  externalId: string;
  orderedAt: Date;
  status: string;
  totalAmount: number;
  customer: RawOrderCustomer;
  items: RawOrderItem[];
}

export interface IntegrationCredentials {
  clientId: string;
  clientSecret: string;
}

export abstract class IntegrationAdapter {
  abstract fetchOrders(credentials: IntegrationCredentials, date: Date): Promise<RawOrder[]>;
}

export const INTEGRATION_ADAPTER = Symbol('INTEGRATION_ADAPTER');
