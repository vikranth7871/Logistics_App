import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';
import { Request, Response } from 'express';

/**
 * Global HTTP exception filter.
 * Produces a consistent error shape across ALL endpoints:
 * { statusCode, error, message, code?, details?, timestamp, path }
 */
@Catch(HttpException)
export class HttpExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(HttpExceptionFilter.name);

  catch(exception: HttpException, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse<Response>();
    const request = ctx.getRequest<Request>();
    const status = exception.getStatus();
    const exceptionResponse = exception.getResponse() as any;

    const errorBody = {
      statusCode: status,
      error:
        typeof exceptionResponse === 'object'
          ? exceptionResponse.error || HttpStatus[status]
          : HttpStatus[status],
      message:
        typeof exceptionResponse === 'object'
          ? exceptionResponse.message || exception.message
          : exceptionResponse,
      ...(exceptionResponse.code && { code: exceptionResponse.code }),
      ...(exceptionResponse.details && { details: exceptionResponse.details }),
      timestamp: new Date().toISOString(),
      path: request.url,
    };

    if (status >= 500) {
      this.logger.error(
        `${request.method} ${request.url} → ${status}`,
        exception.stack,
      );
    }

    response.status(status).json(errorBody);
  }
}
