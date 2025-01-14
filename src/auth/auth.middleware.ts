import { HttpStatus, Injectable, NestMiddleware, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ApiResponse } from 'src/helpers/response.helper';

@Injectable()
export class AuthMiddleware implements NestMiddleware {
  private readonly logger = new Logger(AuthMiddleware.name); // Logger instance

  constructor(private readonly jwtService: JwtService) {}

  use(req: any, res: any, next: (error?: Error | any) => void) {
    // Extract token from authorization header
    const token = req.headers['authorization']?.split(' ')[1];

    if (!token) {
      this.logger.warn('No token found in the Authorization header');
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

      // Store user information in request object
      req.user = decoded;

      // Proceed to the next middleware or route handler
      next();
    } catch (error) {
      // Log the error
      this.logger.error('Token verification failed', error.stack);

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
