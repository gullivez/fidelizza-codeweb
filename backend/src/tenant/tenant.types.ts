export interface TenantContext {
  accountId: string;
  userId: string;
  role: 'owner' | 'admin' | 'operator';
  allowedRestaurantIds: string[];
}
