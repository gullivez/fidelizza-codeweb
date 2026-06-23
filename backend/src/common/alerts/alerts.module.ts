import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../../database/database.module';
import { QUEUE_NAMES } from '../../queues/queue-names';
import { AlertsService } from './alerts.service';
import { AlertsProcessor } from './alerts.processor';
import { AlertsScheduler } from './alerts.scheduler';

@Module({
  imports: [
    DatabaseModule,
    ...QUEUE_NAMES.map((name) => BullModule.registerQueue({ name })),
  ],
  providers: [AlertsService, AlertsProcessor, AlertsScheduler],
})
export class AlertsModule {}
