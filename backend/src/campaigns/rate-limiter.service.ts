import { Injectable } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { RedisService } from '../redis/redis.service';

@Injectable()
export class RateLimiterService {
  constructor(
    private readonly redis: RedisService,
    private readonly config: ConfigService,
  ) {}

  async acquireSlot(restaurantId: string): Promise<void> {
    const limit = this.config.get<number>('campaign.rateLimitPerSec') ?? 10;
    const client = this.redis.getClient();

    for (;;) {
      const second = Math.floor(Date.now() / 1000);
      const key = `rl:campaign:${restaurantId}:${second}`;
      const count = await client.incr(key);
      if (count === 1) await client.expire(key, 1);
      if (count <= limit) return;

      await new Promise((resolve) =>
        setTimeout(resolve, 50 + Math.random() * 100),
      );
    }
  }
}
