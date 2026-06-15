import {
  Body,
  Controller,
  Delete,
  Get,
  HttpCode,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { IntegrationsService } from './integrations.service';
import { CreateIntegrationDto } from './dto/create-integration.dto';
import { UpdateIntegrationDto } from './dto/update-integration.dto';

@ApiTags('Integrations')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/integrations')
@UseGuards(RestaurantAccessGuard)
export class IntegrationsController {
  constructor(
    private readonly integrationsService: IntegrationsService,
    @InjectQueue('integration.ingest') private readonly ingestQueue: Queue,
  ) {}

  @Get()
  @ApiOperation({ summary: 'Lista integrações do restaurante' })
  findAll(@Param('restaurantId') restaurantId: string) {
    return this.integrationsService.findAll(restaurantId);
  }

  @Post()
  @ApiOperation({ summary: 'Cria uma nova integração para o restaurante' })
  create(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: CreateIntegrationDto,
  ) {
    return this.integrationsService.create(restaurantId, dto);
  }

  @Get(':id')
  @ApiOperation({ summary: 'Retorna uma integração pelo ID' })
  findOne(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    return this.integrationsService.findOne(restaurantId, id);
  }

  @Patch(':id')
  @ApiOperation({ summary: 'Atualiza horário de sync ou status da integração' })
  update(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
    @Body() dto: UpdateIntegrationDto,
  ) {
    return this.integrationsService.update(restaurantId, id, dto);
  }

  @Delete(':id')
  @HttpCode(204)
  @ApiOperation({ summary: 'Remove a integração' })
  remove(@Param('restaurantId') restaurantId: string, @Param('id') id: string) {
    return this.integrationsService.remove(restaurantId, id);
  }

  @Post(':id/sync')
  @HttpCode(202)
  @ApiOperation({ summary: 'Dispara sincronização manual' })
  async syncNow(
    @Param('restaurantId') restaurantId: string,
    @Param('id') id: string,
  ) {
    // Validate integration belongs to restaurant before enqueuing
    await this.integrationsService.findOne(restaurantId, id);

    const job = await this.ingestQueue.add(
      'sync',
      { integrationId: id },
      { jobId: `manual-sync:${id}:${Date.now()}` },
    );
    return { jobId: job.id };
  }
}
