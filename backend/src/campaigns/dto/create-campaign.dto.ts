import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import {
  IsIn,
  IsInt,
  IsNotEmpty,
  IsObject,
  IsOptional,
  Max,
  Min,
  ValidatorConstraint,
  ValidatorConstraintInterface,
  Validate,
} from 'class-validator';
import type { TemplateVariableMap } from '../../messaging/variables/template-renderer';

const VALID_SEGMENTS = ['champions', 'new', 'at_risk', 'inactive'] as const;

@ValidatorConstraint({ name: 'isTemplateVariableMap', async: false })
class IsTemplateVariableMapConstraint implements ValidatorConstraintInterface {
  validate(value: unknown): boolean {
    if (typeof value !== 'object' || value === null) return false;
    return Object.values(value as Record<string, unknown>).every((entry) => {
      if (typeof entry !== 'object' || entry === null) return false;
      const e = entry as Record<string, unknown>;
      if (e.type === 'dynamic')
        return typeof e.key === 'string' && e.key.length > 0;
      if (e.type === 'static') return typeof e.value === 'string';
      return false;
    });
  }

  defaultMessage(): string {
    return 'templateVariables deve mapear posição -> { type: "dynamic", key } ou { type: "static", value }';
  }
}

export class CreateCampaignDto {
  @ApiProperty()
  @IsNotEmpty()
  name: string;

  @ApiProperty({ enum: VALID_SEGMENTS })
  @IsIn(VALID_SEGMENTS)
  segmentName: (typeof VALID_SEGMENTS)[number];

  @ApiProperty()
  @IsNotEmpty()
  templateName: string;

  @ApiProperty({ description: 'Twilio Content SID' })
  @IsNotEmpty()
  contentSid: string;

  @ApiProperty({
    description: 'Corpo do template, ex: "Olá {{1}}, sentimos sua falta!"',
  })
  @IsNotEmpty()
  messageBody: string;

  @ApiPropertyOptional({
    default: {},
    description:
      'Mapeia posição -> { type: "dynamic", key } (variável do catálogo) ou { type: "static", value } (texto fixo)',
  })
  @IsOptional()
  @IsObject()
  @Validate(IsTemplateVariableMapConstraint)
  templateVariables?: TemplateVariableMap = {};

  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  attributionWindowDays?: number = 7;
}
