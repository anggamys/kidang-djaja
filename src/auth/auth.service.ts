import { HttpStatus, Injectable, Logger } from '@nestjs/common';
import * as bcrypt from 'bcryptjs';
import { LoginDto } from './dto/auth.dto';
import { PrismaService } from 'src/prisma/prisma.service';
import { ApiResponse } from 'src/helpers/response.helper';
import { JwtService } from '@nestjs/jwt';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly jwtService: JwtService,
    private readonly prismaService: PrismaService,
  ) {}

  /**
   * Hash the password using bcrypt.
   * @param password - Plaintext password
   * @returns Hashed password
   */
  async hashPassword(password: string): Promise<string> {
    this.logger.log('Hashing password...');
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);
    this.logger.debug(`Password successfully hashed: ${hashedPassword}`);
    return hashedPassword;
  }

  /**
   * Authenticate user and return a JWT token.
   * @param loginDto - Login credentials
   * @returns Authenticated user with token
   */
  async login(loginDto: LoginDto) {
    const { email, password } = loginDto;

    this.logger.log(`Login attempt for email: ${email}`);
    try {
      // Check if user exists
      this.logger.log(`Checking if user exists: ${email}`);
      const user = await this.prismaService.users.findUnique({
        where: { email },
      });

      if (!user) {
        this.logger.warn(`User not found: ${email}`);
        throw ApiResponse.error(HttpStatus.BAD_REQUEST, 'User not found');
      }

      this.logger.log(`User found: ${email}`);

      // Validate password
      this.logger.log('Validating password...');
      const isMatch = await bcrypt.compare(password, user.password);

      if (!isMatch) {
        this.logger.warn('Password validation failed');
        throw ApiResponse.error(HttpStatus.BAD_REQUEST, 'Invalid credentials');
      }

      this.logger.log('Password validation successful');

      // Generate JWT token
      this.logger.log('Generating JWT token...');
      const token = this.jwtService.sign(
        {
          id: user.id,
          role: user.role,
        },
        { expiresIn: '1d', secret: process.env.JWT_SECRET },
      );

      this.logger.log(`JWT token generated successfully for user: ${email}`);

      // Return response
      this.logger.log(`Login successful for email: ${email}`);
      return ApiResponse.success(HttpStatus.OK, 'Login success', { token });
    } catch (error) {
      this.logger.error(`Login failed for email: ${email}`, error.stack);
      return ApiResponse.error(
        HttpStatus.INTERNAL_SERVER_ERROR,
        'An error occurred while logging in',
        error.message || 'Unknown error',
      );
    }
  }
}
