import {
  BadRequestException,
  Body,
  Controller,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiBearerAuth, ApiOperation, ApiTags } from '@nestjs/swagger';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import type {
  CampaignResponseDto,
  CampaignDetailResponseDto,
  CampaignPreviewResponseDto,
} from './dto/campaign-response.dto';
import type { DispatchCampaignResponseDto } from './dto/dispatch-campaign.dto';

@ApiTags('Campaigns')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/campaigns')
@UseGuards(RestaurantAccessGuard)
export class CampaignsController {
  constructor(private readonly campaignsService: CampaignsService) {}

  @Post()
  @ApiOperation({ summary: 'Cria uma campanha em draft' })
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateCampaignDto,
  ): Promise<CampaignResponseDto> {
    return this.campaignsService.create(restaurantId, dto);
  }

  @Get()
  @ApiOperation({ summary: 'Lista campanhas do restaurante' })
  findAll(
    @Param('restaurantId') restaurantId: string,
  ): Promise<CampaignResponseDto[]> {
    return this.campaignsService.findAll(restaurantId);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Detalhe da campanha com funil de mensagens' })
  findOne(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ): Promise<CampaignDetailResponseDto> {
    return this.campaignsService.findOne(id, restaurantId);
  }

  @Get(':id/preview')
  @ApiOperation({ summary: 'Pré-visualiza a mensagem para um cliente do segmento' })
  preview(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ): Promise<CampaignPreviewResponseDto> {
    return this.campaignsService.preview(id, restaurantId);
  }

  @Post(':id/dispatch')
  @HttpCode(202)
  @ApiOperation({ summary: 'Enfileira o disparo da campanha' })
  dispatch(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Headers('idempotency-key') idempotencyKey: string,
  ): Promise<DispatchCampaignResponseDto> {
    if (!idempotencyKey) {
      throw new BadRequestException('Header Idempotency-Key é obrigatório');
    }
    return this.campaignsService.dispatch(id, restaurantId, idempotencyKey);
  }
}
