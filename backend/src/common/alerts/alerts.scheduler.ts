import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';

const FIVE_MINUTES_MS = 5 * 60 * 1000;

@Injectable()
export class AlertsScheduler implements OnModuleInit {
  private readonly logger = new Logger(AlertsScheduler.name);

  constructor(@InjectQueue('alerts.check') private readonly queue: Queue) {}

  async onModuleInit(): Promise<void> {
    await this.queue.add(
      'check',
      {},
      {
        repeat: { every: FIVE_MINUTES_MS },
        jobId: 'alerts-check-trigger',
      },
    );
    this.logger.log('Alerts check trigger registered (every 5min)');
  }
}
