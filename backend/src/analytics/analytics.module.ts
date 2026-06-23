import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TenantModule } from '../tenant/tenant.module';
import { SegmentsModule } from '../segments/segments.module';
import { AnalyticsService } from './analytics.service';
import { AnalyticsController } from './analytics.controller';

@Module({
  imports: [DatabaseModule, TenantModule, SegmentsModule],
  controllers: [AnalyticsController],
  providers: [AnalyticsService],
})
export class AnalyticsModule {}
