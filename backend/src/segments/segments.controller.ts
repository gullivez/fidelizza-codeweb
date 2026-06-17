import {
  Controller,
  Get,
  Post,
  Param,
  HttpCode,
  UseGuards,
} from '@nestjs/common';
import {
  ApiTags,
  ApiOperation,
  ApiBearerAuth,
  ApiResponse,
} from '@nestjs/swagger';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { SegmentsService } from './segments.service';
import {
  SegmentStatsResponseDto,
  RecalculateResponseDto,
} from './dto/segment-stats-response.dto';

@ApiTags('Segments')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/segments')
@UseGuards(RestaurantAccessGuard)
export class SegmentsController {
  constructor(private readonly segmentsService: SegmentsService) {}

  @Get()
  @ApiOperation({ summary: 'Distribuição de segmentos RFM do restaurante' })
  @ApiResponse({ type: SegmentStatsResponseDto })
  getStats(
    @Param('restaurantId') restaurantId: string,
  ): Promise<SegmentStatsResponseDto> {
    return this.segmentsService.getStats(restaurantId);
  }

  @Post('recalculate')
  @HttpCode(202)
  @ApiOperation({ summary: 'Enfileira recálculo RFM para o restaurante' })
  @ApiResponse({ status: 202, type: RecalculateResponseDto })
  recalculate(
    @Param('restaurantId') restaurantId: string,
  ): Promise<RecalculateResponseDto> {
    return this.segmentsService.enqueueRecalculate(restaurantId);
  }
}
