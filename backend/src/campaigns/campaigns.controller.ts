import {
  BadRequestException,
  Body,
  Controller,
  Delete,
  Get,
  Headers,
  HttpCode,
  Param,
  Post,
  Query,
  UseGuards,
} from '@nestjs/common';
import {
  ApiBearerAuth,
  ApiOperation,
  ApiResponse,
  ApiTags,
} from '@nestjs/swagger';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { CampaignsService } from './campaigns.service';
import { CreateCampaignDto } from './dto/create-campaign.dto';
import { ListCampaignTargetsQueryDto } from './dto/list-campaign-targets-query.dto';
import type {
  CampaignResponseDto,
  CampaignDetailResponseDto,
  CampaignPreviewResponseDto,
  CampaignTargetListResponseDto,
} from './dto/campaign-response.dto';
import {
  DispatchCampaignDto,
  type DispatchCampaignResponseDto,
} from './dto/dispatch-campaign.dto';

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

  @Get(':id/targets')
  @ApiOperation({
    summary: 'Lista os clientes desta campanha (paginado), com status de envio',
  })
  listTargets(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Query() query: ListCampaignTargetsQueryDto,
  ): Promise<CampaignTargetListResponseDto> {
    return this.campaignsService.listTargets(
      id,
      restaurantId,
      query.page,
      query.limit,
    );
  }

  @Get(':id/preview')
  @ApiOperation({
    summary: 'Pré-visualiza a mensagem para um cliente do segmento',
  })
  preview(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ): Promise<CampaignPreviewResponseDto> {
    return this.campaignsService.preview(id, restaurantId);
  }

  @Post(':id/dispatch')
  @HttpCode(202)
  @ApiOperation({
    summary: 'Enfileira o disparo da campanha (imediato ou agendado)',
  })
  dispatch(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Headers('idempotency-key') idempotencyKey: string,
    @Body() dto: DispatchCampaignDto,
  ): Promise<DispatchCampaignResponseDto> {
    if (!idempotencyKey) {
      throw new BadRequestException('Header Idempotency-Key é obrigatório');
    }
    return this.campaignsService.dispatch(
      id,
      restaurantId,
      idempotencyKey,
      dto.scheduledAt,
    );
  }

  @Post(':id/cancel-schedule')
  @HttpCode(200)
  @ApiOperation({ summary: 'Cancela uma campanha agendada' })
  cancelSchedule(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.campaignsService.cancelSchedule(id, restaurantId);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Exclui uma campanha em rascunho' })
  @ApiResponse({ status: 204, description: 'Excluída com sucesso' })
  @ApiResponse({ status: 404, description: 'Campanha não encontrada' })
  @ApiResponse({ status: 409, description: 'Campanha não está em rascunho' })
  remove(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ): Promise<void> {
    return this.campaignsService.remove(id, restaurantId);
  }
}
