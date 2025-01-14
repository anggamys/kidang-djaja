export class ApiResponse {
  static success(statusCode: number, message: string, data: any) {
    return {
      statusCode,
      status: 'success',
      message,
      data,
    };
  }

  static error(statusCode: number, message: string, errors: any = null) {
    return {
      statusCode,
      status: 'error',
      message,
      errors,
    };
  }
}
