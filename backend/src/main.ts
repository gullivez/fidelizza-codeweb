import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { getQueueToken } from '@nestjs/bullmq';
import { Logger } from 'nestjs-pino';
import helmet from 'helmet';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { createBullBoard } from '@bull-board/api';
import { BullMQAdapter } from '@bull-board/api/bullMQAdapter';
import { ExpressAdapter } from '@bull-board/express';
import type { Queue } from 'bullmq';

import { AppModule } from './app.module';
import { AllExceptionsFilter } from './common/filters/all-exceptions.filter';
import { createBasicAuthMiddleware } from './common/middleware/basic-auth.middleware';
import { QUEUE_NAMES } from './queues/queue-names';

async function bootstrap() {
  const app = await NestFactory.create(AppModule, { bufferLogs: true });
  app.useLogger(app.get(Logger));

  const configService = app.get(ConfigService);
  const port = configService.get<number>('port') ?? 3000;

  app.use(helmet());
  app.enableCors();

  app.useGlobalFilters(new AllExceptionsFilter(app.get(Logger)));
  app.useGlobalPipes(new ValidationPipe({ whitelist: true, transform: true }));

  const queues = QUEUE_NAMES.map((name) => app.get<Queue>(getQueueToken(name)));
  const serverAdapter = new ExpressAdapter();
  serverAdapter.setBasePath('/admin/queues');
  createBullBoard({
    queues: queues.map((queue) => new BullMQAdapter(queue)),
    serverAdapter,
  });
  const bullBoardAuth = createBasicAuthMiddleware(
    configService.get<string>('bullBoard.user')!,
    configService.get<string>('bullBoard.password')!,
  );
  app.use('/admin/queues', bullBoardAuth, serverAdapter.getRouter());

  if (configService.get('nodeEnv') !== 'production') {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('Fidelizza API')
      .setVersion('2.0')
      .addBearerAuth()
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api', app, document);
    app
      .getHttpAdapter()
      .get('/api-json', (_req: unknown, res: { json: (d: unknown) => void }) =>
        res.json(document),
      );
  }

  app.enableShutdownHooks();

  await app.listen(port);
}

void bootstrap();
