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
} from 'class-validator';

const VALID_SEGMENTS = ['champions', 'new', 'at_risk', 'inactive'] as const;

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

  @ApiPropertyOptional({ default: {} })
  @IsOptional()
  @IsObject()
  templateParams?: Record<string, string> = {};

  @ApiPropertyOptional({ default: 7, minimum: 1, maximum: 90 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  @Max(90)
  attributionWindowDays?: number = 7;
}
