import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  ValidateNested,
} from 'class-validator';

const TIME_REGEX = /^([01]\d|2[0-3]):[0-5]\d$/;

export class UpdateIntegrationCredentialsDto {
  @ApiProperty({ example: 'my-client-id' })
  @IsString()
  @IsNotEmpty()
  clientId: string;

  @ApiProperty({ example: 'my-client-secret' })
  @IsString()
  @IsNotEmpty()
  clientSecret: string;
}

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

  @ApiPropertyOptional({
    type: UpdateIntegrationCredentialsDto,
    description:
      'Substitui as credenciais (clientId + clientSecret juntos). Omitir para manter as atuais.',
  })
  @IsOptional()
  @ValidateNested()
  @Type(() => UpdateIntegrationCredentialsDto)
  credentials?: UpdateIntegrationCredentialsDto;
}
