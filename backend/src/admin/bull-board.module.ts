import { Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bullmq';
import { QUEUE_NAMES } from '../queues/queue-names';

/**
 * Registra as mesmas filas do worker para o Bull Board conseguir inspecioná-las.
 * Isso roda no processo HTTP (main.ts) — só registra clientes Queue (produtor/
 * introspecção), não processa jobs. Quem processa continua sendo exclusivamente
 * o worker (main.worker.ts/QueuesModule), então não há duplicação de trabalho.
 */
@Module({
  imports: QUEUE_NAMES.map((name) => BullModule.registerQueue({ name })),
  exports: [BullModule],
})
export class BullBoardModule {}
