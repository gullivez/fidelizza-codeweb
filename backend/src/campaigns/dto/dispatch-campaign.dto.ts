import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsISO8601, IsOptional } from 'class-validator';

export class DispatchCampaignDto {
  @ApiPropertyOptional({
    description: 'ISO 8601 — se ausente, dispara imediatamente',
  })
  @IsOptional()
  @IsISO8601()
  scheduledAt?: string;
}

export class DispatchCampaignResponseDto {
  @ApiProperty() campaignId: string;
  @ApiProperty() status: string;
  @ApiPropertyOptional() estimatedSeconds?: number;
  @ApiPropertyOptional() scheduledAt?: string;
}
