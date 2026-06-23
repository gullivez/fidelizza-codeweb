import { Processor, WorkerHost } from '@nestjs/bullmq';
import { Logger } from '@nestjs/common';
import type { Job } from 'bullmq';
import { AlertsService } from './alerts.service';

@Processor('alerts.check')
export class AlertsProcessor extends WorkerHost {
  private readonly logger = new Logger(AlertsProcessor.name);

  constructor(private readonly alertsService: AlertsService) {
    super();
  }

  async process(job: Job): Promise<void> {
    this.logger.debug(`running alerts check (job ${job.id})`);
    await this.alertsService.runChecks();
  }
}
