import { ApiPropertyOptional } from '@nestjs/swagger';
import { IsIn, IsOptional, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateIntegrationDto {
  @ApiPropertyOptional({
    example: '06:00',
    description: 'Horário UTC da 1ª sync (HH:MM)',
  })
  @IsOptional()
  @Matches(TIME_REGEX, { message: 'syncTime1 deve estar no formato HH:MM' })
  syncTime1?: string;

  @ApiPropertyOptional({
    example: '18:00',
    description: 'Horário UTC da 2ª sync (HH:MM)',
  })
  @IsOptional()
  @Matches(TIME_REGEX, { message: 'syncTime2 deve estar no formato HH:MM' })
  syncTime2?: string | null;

  @ApiPropertyOptional({
    enum: ['active', 'inactive'],
    description: 'Status da integração',
  })
  @IsOptional()
  @IsIn(['active', 'inactive'])
  status?: 'active' | 'inactive';
}
