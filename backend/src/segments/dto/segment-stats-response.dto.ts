import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';

export class SegmentDto {
  @ApiProperty({ example: 'champions' })
  name: string;

  @ApiProperty({ example: 'Campeões' })
  label: string;

  @ApiProperty({ example: '#f59e0b' })
  color: string;

  @ApiProperty()
  count: number;

  @ApiProperty({ description: 'Percentual sobre total de clientes segmentados' })
  percentage: number;
}

export class SegmentStatsResponseDto {
  @ApiProperty({ type: [SegmentDto] })
  segments: SegmentDto[];

  @ApiProperty()
  total: number;

  @ApiPropertyOptional({ nullable: true })
  lastEvaluatedAt: Date | null;
}

export class RecalculateResponseDto {
  @ApiProperty()
  jobId: string;

  @ApiProperty()
  message: string;
}
