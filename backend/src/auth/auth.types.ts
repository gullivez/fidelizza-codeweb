export interface JwtPayload {
  sub: string;
  accountId: string;
  role: 'owner' | 'admin' | 'operator';
  allowedRestaurantIds: string[];
}
