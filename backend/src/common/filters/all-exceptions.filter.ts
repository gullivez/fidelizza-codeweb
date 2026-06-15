import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';
import type { Request, Response } from 'express';

import { DomainError } from '../errors/domain-error';

const ERROR_BASE_URI = 'https://fidelizza.com/errors';

@Catch()
export class AllExceptionsFilter implements ExceptionFilter {
  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();

    if (exception instanceof DomainError) {
      return response.status(exception.status).json({
        type: `${ERROR_BASE_URI}/${exception.code.toLowerCase().replace(/_/g, '-')}`,
        title: exception.code,
        status: exception.status,
        detail: exception.message,
        instance: request.url,
      });
    }

    if (exception instanceof HttpException) {
      const status = exception.getStatus();
      const res = exception.getResponse();
      const detail =
        typeof res === 'string'
          ? res
          : ((res as Record<string, unknown>).message ?? exception.message);

      return response.status(status).json({
        type: `${ERROR_BASE_URI}/http-error`,
        title: exception.name,
        status,
        detail,
        instance: request.url,
      });
    }

    console.error(exception);

    return response.status(HttpStatus.INTERNAL_SERVER_ERROR).json({
      type: `${ERROR_BASE_URI}/internal-error`,
      title: 'Internal Server Error',
      status: 500,
      detail:
        exception instanceof Error ? exception.message : 'Unexpected error',
      instance: request.url,
    });
  }
}
