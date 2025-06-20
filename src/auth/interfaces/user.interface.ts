export interface User {
  id: string;
  email: string;
  name: string;
  password: string;
  role: UserRole;
  isActive: boolean;
  isTwoFactorEnabled: boolean;
  lastLoginAt?: Date;
  lastLoginIp?: string;
  toJSON(): any;
  comparePassword(password: string): Promise<boolean>;
}

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
} 