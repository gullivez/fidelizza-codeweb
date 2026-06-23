import { randomUUID } from 'crypto';

import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import * as Sentry from '@sentry/node';
import type { Request, Response } from 'express';
import type { Logger } from 'nestjs-pino';

import { DomainError } from '../errors/domain-error';

const ERROR_BASE_URI = 'https://fidelizza.com/errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  constructor(private readonly logger: Logger) {}

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request & { id?: string }>();

    // request.id já vem do genReqId do pino-http (header x-request-id, senão
    // randomUUID) — reusar mantém o mesmo id no body do erro e na linha de log.
    const requestId =
      request.id ??
      (request.headers['x-request-id'] as string | undefined) ??
      randomUUID();

    if (exception instanceof DomainError) {
      this.logger.warn(
        { requestId, instance: request.url, code: exception.code },
        exception.message,
      );

      if (exception.status >= 500) Sentry.captureException(exception);

      return response.status(exception.status).json({
        type: `${ERROR_BASE_URI}/${exception.code.toLowerCase().replace(/_/g, '-')}`,
        title: exception.code,
        status: exception.status,
        detail: exception.message,
        instance: request.url,
        requestId,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const resObj =
        typeof res === 'object' && res !== null
          ? (res as Record<string, unknown>)
          : null;

      const title = (resObj?.['error'] as string | undefined) ?? exception.name;
      const rawMessage = resObj?.['message'] ?? res ?? exception.message;
      // ValidationPipe manda um array de mensagens (uma por campo inválido).
      const detail = Array.isArray(rawMessage)
        ? rawMessage.join('; ')
        : typeof rawMessage === 'string'
          ? rawMessage
          : JSON.stringify(rawMessage);

      this.logger.warn({ requestId, instance: request.url, status }, detail);

      if (status >= 500) Sentry.captureException(exception);

      return response.status(status).json({
        type: `${ERROR_BASE_URI}/http-error`,
        title,
        status,
        detail,
        instance: request.url,
        requestId,
      });
    }

    this.logger.error(
      { err: exception, requestId, instance: request.url },
      'unhandled exception',
    );

    Sentry.captureException(exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      type: `${ERROR_BASE_URI}/internal-error`,
      title: 'Internal Server Error',
      status: 500,
      // Nunca repassar exception.message aqui — pode vazar detalhe interno
      // (ex.: erro do Postgres). Stack trace completo só vai pro logger acima.
      detail: 'Ocorreu um erro inesperado. Nossa equipe foi notificada.',
      instance: request.url,
      requestId,
    });
  }
}
