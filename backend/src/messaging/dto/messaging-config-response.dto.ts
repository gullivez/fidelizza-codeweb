import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class MessagingConfigDto {
  @ApiProperty() id: string;
  @ApiProperty() restaurantId: string;
  @ApiPropertyOptional({ nullable: true }) twilioSubaccountSid: string | null;
  @ApiPropertyOptional({ nullable: true }) twilioWhatsappFrom: string | null;
  @ApiProperty({ enum: ['active', 'inactive'] }) status: string;
  @ApiProperty() createdAt: Date;
}
