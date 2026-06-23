import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import type { TemplateVariableMap } from '../../messaging/variables/template-renderer';

export class CampaignResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() segmentName: string;
  @ApiProperty() templateName: string;
  @ApiProperty() contentSid: string;
  @ApiProperty() messageBody: string;
  @ApiProperty() templateVariables: TemplateVariableMap;
  @ApiProperty() status: string;
  @ApiProperty() totalTargets: number;
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional({ nullable: true }) sentAt: Date | null;
  @ApiPropertyOptional({ nullable: true }) scheduledAt: Date | null;
}

export class CampaignFunnelDto {
  @ApiProperty() total: number;
  @ApiProperty() queued: number;
  @ApiProperty() sent: number;
  @ApiProperty() delivered: number;
  @ApiProperty() read: number;
  @ApiProperty() failed: number;
}

export class CampaignDetailResponseDto extends CampaignResponseDto {
  @ApiProperty({ type: CampaignFunnelDto }) funnel: CampaignFunnelDto;
}

export class CampaignPreviewResponseDto {
  @ApiProperty() customerName: string;
  @ApiProperty() phone: string;
  @ApiProperty() renderedMessage: string;
}

export class CampaignTargetItemDto {
  @ApiProperty() customerId: string;
  @ApiProperty() customerName: string;
  @ApiProperty() customerPhone: string;
  @ApiProperty({
    enum: ['queued', 'sent', 'delivered', 'read', 'failed'],
  })
  status: string;
  @ApiPropertyOptional({ nullable: true }) sentAt: Date | null;
  @ApiPropertyOptional({ nullable: true }) failureReason: string | null;
}

export class CampaignTargetListResponseDto {
  @ApiProperty({ type: [CampaignTargetItemDto] }) data: CampaignTargetItemDto[];
  @ApiProperty() total: number;
  @ApiProperty() page: number;
  @ApiProperty() limit: number;
}
