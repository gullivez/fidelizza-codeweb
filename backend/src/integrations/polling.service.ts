import {
  Injectable,
  Logger,
  OnModuleDestroy,
  OnModuleInit,
} from '@nestjs/common';
import { InjectQueue } from '@nestjs/bullmq';
import type { Queue } from 'bullmq';
import { RedisService } from '../redis/redis.service';
import { IntegrationsService } from './integrations.service';

interface CronHandle {
  clear: () => void;
}

@Injectable()
export class PollingService implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(PollingService.name);
  private readonly cronHandles = new Map<string, CronHandle[]>();

  constructor(
    private readonly integrationsService: IntegrationsService,
    private readonly redisService: RedisService,
    @InjectQueue('integration.ingest') private readonly ingestQueue: Queue,
  ) {}

  async onModuleInit() {
    const integrations = await this.integrationsService.findAllActiveRaw();
    for (const integration of integrations) {
      this.schedule(
        integration['id'] as string,
        integration['sync_time_1'] as string,
        integration['sync_time_2'] as string | null,
      );
    }
    this.logger.log(
      `Scheduled polling for ${integrations.length} active integration(s)`,
    );
  }

  onModuleDestroy() {
    for (const handles of this.cronHandles.values()) {
      handles.forEach((h) => h.clear());
    }
    this.cronHandles.clear();
  }

  /** Call when an integration is created or updated. */
  reschedule(
    integrationId: string,
    syncTime1: string,
    syncTime2: string | null,
  ) {
    this.cancelSchedule(integrationId);
    this.schedule(integrationId, syncTime1, syncTime2);
    this.logger.log(`Rescheduled polling for integration ${integrationId}`);
  }

  cancelSchedule(integrationId: string) {
    const handles = this.cronHandles.get(integrationId) ?? [];
    handles.forEach((h) => h.clear());
    this.cronHandles.delete(integrationId);
  }

  private schedule(
    integrationId: string,
    syncTime1: string,
    syncTime2: string | null,
  ) {
    const handles: CronHandle[] = [];
    handles.push(this.buildHandle(integrationId, syncTime1));
    if (syncTime2) {
      handles.push(this.buildHandle(integrationId, syncTime2));
    }
    this.cronHandles.set(integrationId, handles);
  }

  private buildHandle(integrationId: string, time: string): CronHandle {
    const [hour, minute] = time.split(':').map(Number);
    // Node built-in: use setInterval-based daily check
    // We schedule the next fire and then re-schedule after each firing.
    let timeout: NodeJS.Timeout;

    const scheduleNext = () => {
      const now = new Date();
      const next = new Date(
        Date.UTC(
          now.getUTCFullYear(),
          now.getUTCMonth(),
          now.getUTCDate(),
          hour,
          minute,
          0,
          0,
        ),
      );
      if (next <= now) next.setUTCDate(next.getUTCDate() + 1);
      const delay = next.getTime() - now.getTime();

      timeout = setTimeout(() => {
        void this.enqueueSync(integrationId).then(scheduleNext);
      }, delay);
    };

    scheduleNext();

    return {
      clear: () => clearTimeout(timeout),
    };
  }

  private async enqueueSync(integrationId: string) {
    const lockKey = `sync:lock:${integrationId}`;
    const redis = this.redisService.getClient();
    const acquired = await redis.set(lockKey, '1', 'EX', 1800, 'NX');

    if (!acquired) {
      this.logger.warn(
        `Sync already in progress for integration ${integrationId}, skipping`,
      );
      return;
    }

    try {
      await this.ingestQueue.add(
        'sync',
        { integrationId },
        {
          jobId: `scheduled-sync:${integrationId}:${Date.now()}`,
        },
      );
      this.logger.log(
        `Enqueued scheduled sync for integration ${integrationId}`,
      );
    } catch (err) {
      this.logger.error(
        `Failed to enqueue sync for integration ${integrationId}`,
        err,
      );
      await redis.del(lockKey);
    }
  }
}
