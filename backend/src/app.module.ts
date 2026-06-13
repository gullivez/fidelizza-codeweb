import { randomUUID } from 'crypto';

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ConfigModule } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import { validateEnv } from './config/validate-env';

import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { RestaurantsModule } from './restaurants/restaurants.module';

import { JwtAuthGuard } from './common/guards/jwt-auth.guard';
import { TenantContextInterceptor } from './common/interceptors/tenant-context.interceptor';
import { TenantContextService } from './tenant/tenant-context.service';

@Module({
  imports: [
    LoggerModule.forRoot({
      pinoHttp: {
        genReqId: (req) =>
          (req.headers['x-request-id'] as string) ?? randomUUID(),
        transport:
          process.env.NODE_ENV !== 'production'
            ? { target: 'pino-pretty', options: { singleLine: true } }
            : undefined,
      },
    }),
    ConfigModule.forRoot({
      isGlobal: true,
      load: [configuration],
      validate: validateEnv,
    }),
    DatabaseModule,
    RedisModule,
    AuthModule,
    TenantModule,
    RestaurantsModule,
  ],
  controllers: [AppController],
  providers: [
    AppService,
    {
      provide: APP_GUARD,
      useFactory: (reflector: Reflector) => new JwtAuthGuard(reflector),
      inject: [Reflector],
    },
    {
      provide: APP_INTERCEPTOR,
      useFactory: (tenant: TenantContextService, reflector: Reflector) =>
        new TenantContextInterceptor(tenant, reflector),
      inject: [TenantContextService, Reflector],
    },
  ],
})
export class AppModule {}
