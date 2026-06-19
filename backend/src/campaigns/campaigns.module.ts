import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { DatabaseModule } from '../database/database.module';
import { TenantModule } from '../tenant/tenant.module';
import { RestaurantsModule } from '../restaurants/restaurants.module';
import { CampaignsService } from './campaigns.service';
import { CampaignsController } from './campaigns.controller';

@Module({
  imports: [
    DatabaseModule,
    TenantModule,
    RestaurantsModule,
    BullModule.registerQueue({ name: 'campaign.dispatch' }),
  ],
  controllers: [CampaignsController],
  providers: [CampaignsService],
  exports: [CampaignsService],
})
export class CampaignsModule {}
