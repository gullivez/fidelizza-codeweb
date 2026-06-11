import {
  ArgumentsHost,
  Catch,
  ExceptionFilter,
  HttpException,
  HttpStatus,
} from '@nestjs/common';

import { DomainError } from '../errors/domain-error';

@Catch()
export class AllExceptionsFilter
  implements ExceptionFilter
{
  catch(
    exception: unknown,
    host: ArgumentsHost,
  ) {
    const ctx = host.switchToHttp();

    const response = ctx.getResponse();
    const request = ctx.getRequest();

    if (exception instanceof DomainError) {
      return response.status(
        exception.status,
      ).json({
        type: 'business-error',
        code: exception.code,
        status: exception.status,
        detail: exception.message,
        path: request.url,
      });
    }

    if (exception instanceof HttpException) {
      return response.status(
        exception.getStatus(),
      ).json({
        type: 'http-error',
        status: exception.getStatus(),
        detail: exception.message,
        path: request.url,
      });
    }
   console.error(exception);

  return response
   .status(HttpStatus.INTERNAL_SERVER_ERROR)
   .json({
     type: 'internal-error',
     status: 500,
     detail:
       exception instanceof Error
         ? exception.message
          : 'Unexpected error',
     path: request.url,
    });
  }
}