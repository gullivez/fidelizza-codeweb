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
export class CustomerUpdatedListener {
  constructor(
    @InjectQueue('segmentation.recalculate') private readonly queue: Queue,
  ) {}

  @OnEvent('order.created')
  async handleOrderCreated(payload: OrderCreatedPayload): Promise<void> {
    // Debounce: BullMQ deduplicates by jobId — if a job with this id is already
    // in WAITING or DELAYED state, it is not re-added. This coalesces bursts of
    // order.created events for the same restaurant within the 45s delay window.
    await this.queue.add(
      'recalculate',
      { accountId: payload.accountId, restaurantId: payload.restaurantId },
      {
        jobId: `rfm:${payload.restaurantId}`,
        delay: 45_000,
      },
    );
  }
}
