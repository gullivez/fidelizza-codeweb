import type { ApiRestaurant, AuthUser } from './api-types';

let _user: AuthUser | null = null;
let _restaurants: ApiRestaurant[] = [];

export function storeAuthData(user: AuthUser, restaurants: ApiRestaurant[]): void {
  _user = user;
  _restaurants = restaurants;
}

export function consumeAuthData(): { user: AuthUser | null; restaurants: ApiRestaurant[] } {
  const result = { user: _user, restaurants: _restaurants };
  _user = null;
  _restaurants = [];
  return result;
}
