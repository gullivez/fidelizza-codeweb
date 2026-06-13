import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class UpdateRestaurantDto {
  @IsOptional()
  @IsString()
  @MaxLength(255)
  name?: string;

  @IsOptional()
  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug?: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
