import { HttpStatus, Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/helpers/response.helper';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name); // Logger instance

  constructor(private readonly jwtService: JwtService) {}

  use(req: any, res: any, next: (error?: Error | any) => void) {
    this.logger.log('AuthMiddleware invoked.');

    // Extract token from authorization header
    const authorizationHeader = req.headers['authorization'];
    const token = authorizationHeader?.split(' ')[1];

    if (!authorizationHeader) {
      this.logger.warn('Authorization header is missing.');
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          ApiResponse.error(
            HttpStatus.UNAUTHORIZED,
            'Authorization header tidak ditemukan',
          ),
        );
    }

    if (!token) {
      this.logger.warn('Token is missing from the Authorization header.');
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          ApiResponse.error(HttpStatus.UNAUTHORIZED, 'Token tidak ditemukan'),
        );
    }

    try {
      this.logger.log('Attempting to verify token...');
      // Verify token
      const decoded = this.jwtService.verify(token, {
        secret: process.env.JWT_SECRET, // Ensure JWT_SECRET is loaded correctly from environment variables
      });

      this.logger.log('Token verified successfully.');
      this.logger.debug(`Decoded token: ${JSON.stringify(decoded)}`);

      // Store user information in request object
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Log the error details
      this.logger.error(
        'Token verification failed.',
        error.stack || error.message || 'Unknown error',
      );

      // Handle verification failure (e.g., invalid or expired token)
      return res
        .status(HttpStatus.UNAUTHORIZED)
        .json(
          ApiResponse.error(
            HttpStatus.UNAUTHORIZED,
            'Token tidak valid atau kedaluwarsa',
          ),
        );
    }
  }
}
