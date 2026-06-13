export class LoginResponseDto {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    name: string;
    email: string;
    role: string;
    allowedRestaurantIds: string[];
  };
}
