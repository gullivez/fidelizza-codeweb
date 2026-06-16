import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { RfmEngineService } from './rfm-engine.service';
import { DailyRfmScheduler } from './daily-rfm.scheduler';

interface RecalculateJobData {
  accountId: string;
  restaurantId: string;
}

@Processor('segmentation.recalculate', { concurrency: 5 })
export class SegmentationProcessor extends WorkerHost {
  private readonly logger = new Logger(SegmentationProcessor.name);

  constructor(
    private readonly rfmEngineService: RfmEngineService,
    private readonly dailyRfmScheduler: DailyRfmScheduler,
  ) {
    super();
  }

  async process(job: Job<RecalculateJobData>): Promise<void> {
    if (job.name === 'daily-trigger') {
      await this.dailyRfmScheduler.enqueueAllRestaurants();
      return;
    }

    const { accountId, restaurantId } = job.data;
    const start = Date.now();
    this.logger.log(
      { restaurantId, jobId: job.id },
      'RFM recalculate started',
    );

    const count = await this.rfmEngineService.recalculate(accountId, restaurantId);

    this.logger.log(
      { restaurantId, jobId: job.id, count, ms: Date.now() - start },
      'RFM recalculate done',
    );
  }
}
