import { UserRole } from './user.interface';

export interface JwtPayload {
  sub: string;        // User ID
  email: string;      // Email
  role: UserRole;     // Role
  iat: number;        // Issued at
  exp?: number;       // Expiration (optional, will be set by JWT service)
}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
} 