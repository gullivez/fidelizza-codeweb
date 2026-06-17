import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { DatabaseService } from '../database/database.service';

@Injectable()
export class DailyRfmScheduler implements OnModuleInit {
  private readonly logger = new Logger(DailyRfmScheduler.name);

  constructor(
    @InjectQueue('segmentation.recalculate') private readonly queue: Queue,
    private readonly db: DatabaseService,
  ) {}

  async onModuleInit(): Promise<void> {
    // Register the daily repeatable trigger job.
    // Runs at 06:00 UTC = 03:00 BRT every day.
    await this.queue.add(
      'daily-trigger',
      {},
      {
        repeat: { pattern: '0 6 * * *' },
        jobId: 'daily-rfm-trigger',
      },
    );
    this.logger.log('Daily RFM trigger registered (cron: 0 6 * * *)');
  }

  // Called by the SegmentationProcessor when it receives a 'daily-trigger' job.
  async enqueueAllRestaurants(): Promise<void> {
    const rows = await this.db.getSql()`
      SELECT DISTINCT account_id, restaurant_id
      FROM integration
      WHERE status = 'active'
    `;

    this.logger.log(
      { count: rows.length },
      'Daily RFM: enqueueing per-restaurant jobs',
    );

    for (const row of rows) {
      await this.queue.add(
        'recalculate',
        {
          accountId: row['account_id'] as string,
          restaurantId: row['restaurant_id'] as string,
        },
        { jobId: `rfm:daily:${row['restaurant_id'] as string}` },
      );
    }
  }
}
