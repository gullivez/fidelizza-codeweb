import { apiRequest } from "../api-client";
import type { ApiRestaurant } from "../api-types";

export function updateRestaurant(
  restaurantId: string,
  data: { name: string },
): Promise<ApiRestaurant> {
  return apiRequest<ApiRestaurant>(`/restaurants/${restaurantId}`, {
    method: "PATCH",
    body: JSON.stringify(data),
  });
}
