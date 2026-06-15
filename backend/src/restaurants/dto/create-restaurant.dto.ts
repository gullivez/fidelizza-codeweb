import { ApiProperty, ApiPropertyOptional } from '@nestjs/swagger';
import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRestaurantDto {
  @ApiProperty({ example: 'Meu Restaurante' })
  @IsString()
  @MaxLength(255)
  name: string;

  @ApiProperty({ example: 'meu-restaurante' })
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @ApiPropertyOptional({ example: '+5511999990001' })
  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
