import {
  Body,
  Controller,
  Get,
  HttpCode,
  NotFoundException,
  Param,
  Patch,
  Post,
  UseGuards,
} from '@nestjs/common';
import { ApiTags, ApiOperation, ApiBearerAuth } from '@nestjs/swagger';
import { RestaurantAccessGuard } from '../common/guards/restaurant-access.guard';
import { MessagingConfigService } from './messaging-config.service';
import { UpdateMessagingConfigDto } from './dto/update-messaging-config.dto';

@ApiTags('Messaging Config')
@ApiBearerAuth()
@Controller('restaurants/:restaurantId/messaging')
@UseGuards(RestaurantAccessGuard)
export class MessagingConfigController {
  constructor(
    private readonly messagingConfigService: MessagingConfigService,
  ) {}

  @Post('subaccount')
  @HttpCode(201)
  @ApiOperation({
    summary:
      'Cria (ou retorna, se já existir) a subconta Twilio do restaurante',
  })
  createOrGetSubaccount(@Param('restaurantId') restaurantId: string) {
    return this.messagingConfigService.createOrGetSubaccount(restaurantId);
  }

  @Get('config')
  @ApiOperation({
    summary: 'Retorna a configuração de mensageria do restaurante',
  })
  async getConfig(@Param('restaurantId') restaurantId: string) {
    const config = await this.messagingConfigService.getConfig(restaurantId);
    if (!config)
      throw new NotFoundException('Configuração de mensageria não encontrada');
    return config;
  }

  @Patch('config')
  @ApiOperation({
    summary: 'Atualiza o número de envio ou status da configuração',
  })
  updateConfig(
    @Param('restaurantId') restaurantId: string,
    @Body() dto: UpdateMessagingConfigDto,
  ) {
    return this.messagingConfigService.updateConfig(restaurantId, dto);
  }

  @Get('templates')
  @ApiOperation({
    summary: 'Lista templates WhatsApp aprovados da subconta Twilio',
  })
  listTemplates(@Param('restaurantId') restaurantId: string) {
    return this.messagingConfigService.listTemplates(restaurantId);
  }

  @Get('variables')
  @ApiOperation({
    summary: 'Lista o catálogo de variáveis dinâmicas disponíveis',
  })
  listVariables() {
    return this.messagingConfigService.listVariables();
  }
}
