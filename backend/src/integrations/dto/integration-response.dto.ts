import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class IntegrationResponseDto {
  @ApiProperty() id: string;
  @ApiProperty() restaurantId: string;
  @ApiProperty() provider: string;
  @ApiProperty({ enum: ['active', 'inactive', 'error'] }) status: string;
  @ApiProperty() syncTime1: string;
  @ApiPropertyOptional({ nullable: true }) syncTime2: string | null;
  @ApiPropertyOptional({ nullable: true }) lastSyncAt: Date | null;
  @ApiPropertyOptional({ nullable: true }) lastError: string | null;
  @ApiProperty() createdAt: Date;
}
