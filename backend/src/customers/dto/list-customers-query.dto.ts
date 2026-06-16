import { ApiPropertyOptional } from '@nestjs/swagger';
import { Type } from 'class-transformer';
import { IsIn, IsInt, IsOptional, IsString, Min } from 'class-validator';

const VALID_SEGMENTS = ['champions', 'new', 'at_risk', 'inactive'] as const;

export class ListCustomersQueryDto {
  @ApiPropertyOptional({ default: 1 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  page: number = 1;

  @ApiPropertyOptional({ default: 20 })
  @IsOptional()
  @Type(() => Number)
  @IsInt()
  @Min(1)
  limit: number = 20;

  @ApiPropertyOptional({ description: 'Busca por nome ou telefone' })
  @IsOptional()
  @IsString()
  search?: string;

  @ApiPropertyOptional({
    description: 'Filtro por segmento RFM',
    enum: VALID_SEGMENTS,
  })
  @IsOptional()
  @IsIn(VALID_SEGMENTS)
  segment?: (typeof VALID_SEGMENTS)[number];
}
