import { randomUUID } from 'crypto';

import { Module } from '@nestjs/common';
import { APP_GUARD, APP_INTERCEPTOR, Reflector } from '@nestjs/core';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { LoggerModule } from 'nestjs-pino';
import { BullModule } from '@nestjs/bullmq';
import { EventEmitterModule } from '@nestjs/event-emitter';

import { AppController } from './app.controller';
import { AppService } from './app.service';

import configuration from './config/configuration';
import { validateEnv } from './config/validate-env';

import { CryptoModule } from './common/crypto/crypto.module';
import { DatabaseModule } from './database/database.module';
import { RedisModule } from './redis/redis.module';
import { AuthModule } from './auth/auth.module';
import { TenantModule } from './tenant/tenant.module';
import { RestaurantsModule } from './restaurants/restaurants.module';
import { IntegrationsModule } from './integrations/integrations.module';
import { CustomersModule } from './customers/customers.module';
import { OrdersModule } from './orders/orders.module';
import { SegmentsModule } from './segments/segments.module';
import { MessagingModule } from './messaging/messaging.module';
import { CampaignsModule } from './campaigns/campaigns.module';
import { AnalyticsModule } from './analytics/analytics.module';

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
    BullModule.forRootAsync({
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        connection: {
          host: config.get<string>('redis.host'),
          port: config.get<number>('redis.port'),
        },
      }),
    }),
    EventEmitterModule.forRoot(),
    CryptoModule,
    DatabaseModule,
    RedisModule,
    AuthModule,
    TenantModule,
    RestaurantsModule,
    IntegrationsModule,
    CustomersModule,
    OrdersModule,
    SegmentsModule,
    MessagingModule,
    CampaignsModule,
    AnalyticsModule,
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
