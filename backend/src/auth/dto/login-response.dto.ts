import { ApiProperty } from '@nestjs/swagger';

export class LoginUserDto {
  @ApiProperty() id: string;
  @ApiProperty() name: string;
  @ApiProperty() email: string;
  @ApiProperty() role: string;
  @ApiProperty({ type: [String] }) allowedRestaurantIds: string[];
}

export class LoginResponseDto {
  @ApiProperty() accessToken: string;
  @ApiProperty() refreshToken: string;
  @ApiProperty({ type: LoginUserDto }) user: LoginUserDto;
}
