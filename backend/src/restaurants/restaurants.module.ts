import { Module } from '@nestjs/common';
import { DatabaseModule } from '../database/database.module';
import { TenantModule } from '../tenant/tenant.module';
import { RestaurantsService } from './restaurants.service';
import { RestaurantsController } from './restaurants.controller';

@Module({
  imports: [DatabaseModule, TenantModule],
  providers: [RestaurantsService],
  controllers: [RestaurantsController],
  exports: [RestaurantsService],
})
export class RestaurantsModule {}
