import { Controller, Get, Param, Query, UseGuards } from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { AnalyticsService } from './analytics.service';
import {
  DashboardQueryDto,
  DashboardResponseDto,
  RfmDistributionDto,
  WhatsappStatusDto,
} from './dto/dashboard-response.dto';

@ApiTags('Analytics')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/analytics')
@UseGuards(RestaurantAccessGuard)
export class AnalyticsController {
  constructor(private readonly analyticsService: AnalyticsService) {}

  @Get('dashboard')
  @ApiOperation({
    summary: 'KPIs de receita atribuída e funil da última campanha',
  })
  @ApiResponse({ type: DashboardResponseDto })
  getDashboard(
    @Param('restaurantId') restaurantId: string,
    @Query() query: DashboardQueryDto,
  ): Promise<DashboardResponseDto> {
    return this.analyticsService.getDashboard(restaurantId, query.period);
  }

  @Get('rfm-distribution')
  @ApiOperation({ summary: 'Distribuição atual de clientes por segmento RFM' })
  @ApiResponse({ type: RfmDistributionDto })
  getRfmDistribution(
    @Param('restaurantId') restaurantId: string,
  ): Promise<RfmDistributionDto> {
    return this.analyticsService.getRfmDistribution(restaurantId);
  }

  @Get('whatsapp-status')
  @ApiOperation({ summary: 'Status do número de WhatsApp' })
  @ApiResponse({ type: WhatsappStatusDto })
  getWhatsappStatus(): Promise<WhatsappStatusDto> {
    return this.analyticsService.getWhatsappStatus();
  }
}
