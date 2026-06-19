import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, IsString } from 'class-validator';

export class UpdateMessagingConfigDto {
  @ApiPropertyOptional({ example: 'whatsapp:+5519999999999' })
  @IsOptional()
  @IsString()
  twilioWhatsappFrom?: string;

  @ApiPropertyOptional({ enum: ['active', 'inactive'] })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: string;
}
