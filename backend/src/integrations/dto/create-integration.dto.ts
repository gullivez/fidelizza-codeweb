import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsString, IsNotEmpty, IsOptional, Matches } from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class CreateIntegrationDto {
  @ApiProperty({ example: 'anota_ai', description: 'Provedor de integração' })
  @IsString()
  @IsNotEmpty()
  provider: string = 'anota_ai';

  @ApiProperty({ example: 'my-client-id' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'my-client-secret' })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;

  @ApiPropertyOptional({ example: '03:00', description: 'Horário UTC da 1ª sincronização diária (HH:MM)' })
  @IsOptional()
  @Matches(TIME_REGEX, { message: 'syncTime1 deve estar no formato HH:MM' })
  syncTime1?: string;

  @ApiPropertyOptional({ example: '15:00', description: 'Horário UTC da 2ª sincronização diária (HH:MM), opcional' })
  @IsOptional()
  @Matches(TIME_REGEX, { message: 'syncTime2 deve estar no formato HH:MM' })
  syncTime2?: string;
}
