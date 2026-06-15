import { Controller, Get, Res } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { Response } from 'express';

import { DatabaseService } from './database/database.service';
import { RedisService } from './redis/redis.service';
import { SkipAuth } from './common/decorators/skip-auth.decorator';

@SkipAuth()
@Controller()
export class AppController {
  constructor(
    private readonly configService: ConfigService,
    private readonly databaseService: DatabaseService,
    private readonly redisService: RedisService,
  ) {}

  @Get()
  getHello() {
    return {
      status: 'ok',
      env: this.configService.get<string>('nodeEnv'),
      port: this.configService.get<number>('port'),
    };
  }

  @Get('/health')
  getHealth() {
    return { status: 'online' };
  }

  @Get('/health/ready')
  async getHealthReady(@Res({ passthrough: true }) res: Response) {
    const checks: Record<string, 'ok' | 'error'> = {};

    try {
      await this.databaseService.testConnection();
      checks.database = 'ok';
    } catch {
      checks.database = 'error';
    }

    try {
      await this.redisService.ping();
      checks.redis = 'ok';
    } catch {
      checks.redis = 'error';
    }

    const allOk = Object.values(checks).every((v) => v === 'ok');

    if (!allOk) {
      res.status(503);
    }

    return { status: allOk ? 'ready' : 'degraded', checks };
  }
}
