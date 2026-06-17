import { ApiProperty } from '@nestjs/swagger';

export class DispatchCampaignResponseDto {
  @ApiProperty() campaignId: string;
  @ApiProperty() status: string;
  @ApiProperty() estimatedSeconds: number;
}
