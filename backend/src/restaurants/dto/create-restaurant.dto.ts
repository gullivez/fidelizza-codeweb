import { IsOptional, IsString, Matches, MaxLength } from 'class-validator';

export class CreateRestaurantDto {
  @IsString()
  @MaxLength(255)
  name: string;

  @IsString()
  @MaxLength(100)
  @Matches(/^[a-z0-9-]+$/, { message: 'slug deve conter apenas letras minúsculas, números e hífens' })
  slug: string;

  @IsOptional()
  @IsString()
  @MaxLength(20)
  phone?: string;
}
