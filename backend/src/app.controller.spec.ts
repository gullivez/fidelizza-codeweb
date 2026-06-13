import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';

import { AppController } from './app.controller';
import { AppService } from './app.service';
import { DatabaseService } from './database/database.service';
import { RedisService } from './redis/redis.service';

const mockConfigService = { get: jest.fn() };
const mockDatabaseService = { testConnection: jest.fn() };
const mockRedisService = { ping: jest.fn() };

describe('AppController', () => {
  let appController: AppController;

  beforeEach(async () => {
    jest.clearAllMocks();

    const app: TestingModule = await Test.createTestingModule({
      controllers: [AppController],
      providers: [
        AppService,
        { provide: ConfigService, useValue: mockConfigService },
        { provide: DatabaseService, useValue: mockDatabaseService },
        { provide: RedisService, useValue: mockRedisService },
      ],
    }).compile();

    appController = app.get<AppController>(AppController);
  });

  describe('GET /health', () => {
    it('returns status online', () => {
      expect(appController.getHealth()).toEqual({ status: 'online' });
    });
  });

  describe('GET /health/ready', () => {
    const mockRes = { status: jest.fn() } as any;

    it('returns ready when DB and Redis are up', async () => {
      mockDatabaseService.testConnection.mockResolvedValue([{ status: 1 }]);
      mockRedisService.ping.mockResolvedValue('PONG');

      const result = await appController.getHealthReady(mockRes);

      expect(result).toEqual({
        status: 'ready',
        checks: { database: 'ok', redis: 'ok' },
      });
      expect(mockRes.status).not.toHaveBeenCalled();
    });

    it('returns degraded with 503 when Redis is down', async () => {
      mockDatabaseService.testConnection.mockResolvedValue([{ status: 1 }]);
      mockRedisService.ping.mockRejectedValue(new Error('Connection refused'));

      const result = await appController.getHealthReady(mockRes);

      expect(result).toEqual({
        status: 'degraded',
        checks: { database: 'ok', redis: 'error' },
      });
      expect(mockRes.status).toHaveBeenCalledWith(503);
    });
  });
});
