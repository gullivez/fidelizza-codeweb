import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class CampaignResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() segmentName: string;
  @ApiProperty() templateName: string;
  @ApiProperty() contentSid: string;
  @ApiProperty() messageBody: string;
  @ApiProperty() status: string;
  @ApiProperty() totalTargets: number;
  @ApiProperty() createdAt: Date;
  @ApiPropertyOptional({ nullable: true }) sentAt: Date | null;
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
