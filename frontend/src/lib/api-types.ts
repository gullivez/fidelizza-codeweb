export type AuthUser = {
  id: string;
  name: string;
  email: string;
  role: 'owner' | 'admin' | 'operator';
  allowedRestaurantIds: string[];
};

export type LoginResponse = {
  accessToken: string;
  refreshToken: string;
  user: AuthUser;
};

export type ApiRestaurant = {
  id: string;
  name: string;
  slug: string;
  phone?: string | null;
  status: string;
  created_at: string;
};
