import {
  ExceptionFilter,
  Catch,
  ArgumentsHost,
  HttpException,
  HttpStatus,
  Logger,
} from '@nestjs/common';

@Catch()
export class CustomExceptionFilter implements ExceptionFilter {
  private readonly logger = new Logger(CustomExceptionFilter.name);

  catch(exception: unknown, host: ArgumentsHost) {
    const ctx = host.switchToHttp();
    const response = ctx.getResponse();

    let status: number;
    let responseBody: any;

    // Jika exception adalah HttpException
    if (exception instanceof HttpException) {
      status = exception.getStatus();
      const errorResponse = exception.getResponse();

      // Pastikan format error konsisten
      responseBody =
        typeof errorResponse === 'object'
          ? errorResponse
          : {
              statusCode: status,
              message: errorResponse,
            };

      // Log untuk HttpException
      // this.logger.warn(
      //   `HttpException: ${JSON.stringify(responseBody)}`,
      //   exception.stack,
      // );
    } else {
      // Jika exception adalah Error atau lainnya
      status = HttpStatus.INTERNAL_SERVER_ERROR;

      // Struktur respons default untuk error internal
      responseBody = {
        statusCode: status,
        message: 'Internal server error',
        error: exception instanceof Error ? exception.message : exception,
      };

      // Log untuk error internal
      this.logger.error(
        'Unexpected exception',
        exception instanceof Error ? exception.stack : exception,
      );
    }

    // Kirim respons
    response.status(status).json(responseBody);
  }
}
