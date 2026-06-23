import { Injectable } from '@nestjs/common';
import { OnEvent } from '@nestjs/event-emitter';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

interface OrderCreatedPayload {
  orderId: string;
  customerId: string;
  restaurantId: string;
  accountId: string;
}

@Injectable()
export class OrderConversionListener {
  constructor(
    @InjectQueue('conversion.attribution') private readonly queue: Queue,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreated(payload: OrderCreatedPayload): Promise<void> {
    await this.queue.add(
      'attribute',
      {
        restaurantOrderId: payload.orderId,
        accountId: payload.accountId,
        restaurantId: payload.restaurantId,
      },
      { jobId: `conversion:${payload.orderId}` },
    );
  }
}
