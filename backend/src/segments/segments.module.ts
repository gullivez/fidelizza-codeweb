import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { TenantModule } from '../tenant/tenant.module';
import { SegmentsService } from './segments.service';
import { SegmentsController } from './segments.controller';

@Module({
  imports: [
    DatabaseModule,
    TenantModule,
    BullModule.registerQueue({ name: 'segmentation.recalculate' }),
  ],
  controllers: [SegmentsController],
  providers: [SegmentsService],
  exports: [SegmentsService],
})
export class SegmentsModule {}
