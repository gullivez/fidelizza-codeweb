import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional } from 'class-validator';

export type DashboardPeriod = '7d' | '30d' | '90d';

export class DashboardQueryDto {
  @ApiPropertyOptional({ enum: ['7d', '30d', '90d'], default: '30d' })
  @IsOptional()
  @IsIn(['7d', '30d', '90d'])
  period: DashboardPeriod = '30d';
}

export class DashboardKpisDto {
  @ApiProperty({ description: 'Receita atribuída no período (last-touch)' })
  revenue: number;

  @ApiProperty({ description: '% de variação vs período anterior equivalente' })
  revenueDelta: number;

  @ApiProperty({ description: '% conversões sobre mensagens entregues' })
  conversion: number;

  @ApiProperty({ description: 'Clientes distintos com conversão no período' })
  reactivated: number;

  @ApiProperty({ description: 'Campanhas enviadas no período' })
  campaignsSent: number;
}

export class LastCampaignDto {
  @ApiProperty() name: string;
  @ApiProperty() sent: number;
  @ApiProperty() delivered: number;
  @ApiProperty() read: number;
  @ApiProperty() orders: number;
  @ApiProperty() revenue: number;
}

export class DashboardResponseDto {
  @ApiProperty({ type: DashboardKpisDto })
  kpis: DashboardKpisDto;

  @ApiPropertyOptional({ type: LastCampaignDto, nullable: true })
  lastCampaign: LastCampaignDto | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Sprint 7 (Meta Cloud API)',
  })
  cost: number | null;

  @ApiPropertyOptional({
    nullable: true,
    description: 'Sprint 7 (Meta Cloud API)',
  })
  revenueNet: number | null;
}

export class RfmDistributionDto {
  @ApiProperty() champions: number;
  @ApiProperty() new: number;
  @ApiProperty() atRisk: number;
  @ApiProperty() inactive: number;
}

export class WhatsappStatusDto {
  @ApiProperty({ example: 'sandbox' })
  status: string;

  @ApiProperty({ example: 'Número em modo sandbox' })
  label: string;

  @ApiProperty()
  healthy: boolean;
}
