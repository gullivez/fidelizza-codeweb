import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { Observable } from 'rxjs';

import { TenantContextService } from '../../tenant/tenant-context.service';
import { SKIP_AUTH_KEY } from '../decorators/skip-auth.decorator';
import type { JwtPayload } from '../../auth/auth.types';

@Injectable()
export class TenantContextInterceptor implements NestInterceptor {
  constructor(
    private readonly tenantContext: TenantContextService,
    private readonly reflector: Reflector,
  ) {}

  intercept(ctx: ExecutionContext, next: CallHandler): Observable<unknown> {
    const skip = this.reflector.getAllAndOverride<boolean>(SKIP_AUTH_KEY, [
      ctx.getHandler(),
      ctx.getClass(),
    ]);
    if (skip) return next.handle();

    const request = ctx.switchToHttp().getRequest();
    const user = request.user as JwtPayload | undefined;
    if (!user) return next.handle();

    return new Observable((subscriber) => {
      this.tenantContext.run(
        {
          accountId: user.accountId,
          userId: user.sub,
          role: user.role,
          allowedRestaurantIds: user.allowedRestaurantIds,
        },
        () => {
          next.handle().subscribe(subscriber);
        },
      );
    });
  }
}
