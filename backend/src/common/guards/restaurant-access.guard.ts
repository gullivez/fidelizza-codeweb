import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { Request } from 'express';
import type { JwtPayload } from '../../auth/auth.types';

@Injectable()
export class RestaurantAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context
      .switchToHttp()
      .getRequest<Request & { user: JwtPayload }>();
    const user = request.user;
    const rawParam = request.params['restaurantId'] ?? request.params['id'];
    const restaurantId = Array.isArray(rawParam) ? rawParam[0] : rawParam;

    if (!restaurantId) return true;

    // allowedRestaurantIds is scoped to the user's own account (see AuthService.resolveAllowedRestaurants).
    // Checking it for ALL roles enforces tenant isolation even for owner/admin —
    // a restaurantId from another tenant will never appear in their list.
    if (!user.allowedRestaurantIds.includes(restaurantId)) {
      throw new ForbiddenException('Acesso negado a este restaurante');
    }

    return true;
  }
}
