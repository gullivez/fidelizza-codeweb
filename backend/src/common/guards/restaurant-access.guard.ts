import {
  CanActivate,
  ExecutionContext,
  ForbiddenException,
  Injectable,
} from '@nestjs/common';
import type { JwtPayload } from '../../auth/auth.types';

@Injectable()
export class RestaurantAccessGuard implements CanActivate {
  canActivate(context: ExecutionContext): boolean {
    const request = context.switchToHttp().getRequest();
    const user = request.user as JwtPayload;
    const restaurantId = request.params?.restaurantId ?? request.params?.id;

    if (!restaurantId) return true;

    if (
      user.role !== 'owner' &&
      user.role !== 'admin' &&
      !user.allowedRestaurantIds.includes(restaurantId)
    ) {
      throw new ForbiddenException('Acesso negado a este restaurante');
    }

    return true;
  }
}
