import { Injectable, UnauthorizedException, ConflictException, BadRequestException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectModel } from '@nestjs/sequelize';
import { User, UserRole } from './entities/User.model';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtPayload, Tokens } from './interfaces/jwt-payload.interface';
import { ConfigService } from '@nestjs/config';
import * as crypto from 'crypto';

// Временный интерфейс для тестирования
// interface User {
//   id: string;
//   email: string;
//   name: string;
//   password: string;
//   role: UserRole;
//   isActive: boolean;
//   isTwoFactorEnabled: boolean;
//   lastLoginAt?: Date;
//   lastLoginIp?: string;
//   toJSON(): any;
//   comparePassword(password: string): Promise<boolean>;
// }

// enum UserRole {
//   USER = 'user',
//   ADMIN = 'admin'
// }

@Injectable()
export class AuthService {
  private readonly revokedTokens = new Set<string>();

  constructor(
    @InjectModel(User)
    private userModel: typeof User,
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {}

  async register(registerDto: RegisterDto): Promise<{ user: Partial<User>; tokens: Tokens }> {
    // Проверяем совпадение паролей
    if (registerDto.password !== registerDto.confirmPassword) {
      throw new BadRequestException('Пароли не совпадают');
    }

    // Проверяем существование пользователя
    const existingUser = await this.userModel.findOne({
      where: { email: registerDto.email }
    });

    if (existingUser) {
      throw new ConflictException('Пользователь с таким email уже существует');
    }

    // Создаем пользователя
    const user = await this.userModel.create({
      email: registerDto.email,
      name: registerDto.name,
      password: registerDto.password,
      role: UserRole.USER,
      emailVerificationToken: crypto.randomBytes(32).toString('hex'),
    });

    const tokens = await this.generateTokens(user);

    return {
      user: user.toJSON(),
      tokens
    };
  }

  async login(loginDto: LoginDto, clientIp: string): Promise<{ user: Partial<User>; tokens: Tokens }> {
    // Проверяем, что email не undefined
    if (!loginDto.email) {
      throw new BadRequestException('Email обязателен для входа');
    }

    const user = await this.validateUser(loginDto.email, loginDto.password);
    
    if (!user) {
      throw new UnauthorizedException('Неверный email или пароль');
    }

    if (!user.isActive) {
      throw new UnauthorizedException('Аккаунт заблокирован');
    }

    // Проверяем двухфакторную аутентификацию
    if (user.isTwoFactorEnabled) {
      if (!loginDto.twoFactorCode) {
        throw new UnauthorizedException('Требуется код двухфакторной аутентификации');
      }
      
      const isValid = await this.verifyTwoFactorCode(user, loginDto.twoFactorCode);
      if (!isValid) {
        throw new UnauthorizedException('Неверный код двухфакторной аутентификации');
      }
    }

    // Обновляем информацию о последнем входе
    await user.update({
      lastLoginAt: new Date(),
      lastLoginIp: clientIp,
    });

    const tokens = await this.generateTokens(user, loginDto.rememberMe === 'true');

    return {
      user: user.toJSON(),
      tokens
    };
  }

  async validateUser(email: string, password: string): Promise<User | null> {
    // Проверяем, что email не undefined
    if (!email) {
      return null;
    }

    const user = await this.userModel.findOne({
      where: { email }
    });

    if (user && await user.comparePassword(password)) {
      return user;
    }

    return null;
  }

  async refreshTokens(refreshTokenDto: RefreshTokenDto): Promise<Tokens> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken);
      
      // Проверяем, не отозван ли токен
      if (this.revokedTokens.has(refreshTokenDto.refreshToken)) {
        throw new UnauthorizedException('Token revoked');
      }

      const user = await this.userModel.findByPk(payload.sub);

      if (!user || !user.isActive) {
        throw new UnauthorizedException('User not found or inactive');
      }

      return this.generateTokens(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async logout(refreshToken: string): Promise<void> {
    // Добавляем токен в список отозванных
    this.revokedTokens.add(refreshToken);
    
    // Очищаем старые отозванные токены (каждые 1000 токенов)
    if (this.revokedTokens.size > 1000) {
      const tokensArray = Array.from(this.revokedTokens);
      this.revokedTokens.clear();
      tokensArray.slice(-500).forEach(token => this.revokedTokens.add(token));
    }
  }

  async generateTokens(user: User, rememberMe = false): Promise<Tokens> {
    const payload: JwtPayload = {
      sub: user.id,
      email: user.email,
      role: user.role,
      iat: Math.floor(Date.now() / 1000),
    };

    const accessToken = this.jwtService.sign(payload, { expiresIn: '15m' });
    const refreshToken = this.jwtService.sign(
      { ...payload, type: 'refresh' },
      { 
        expiresIn: rememberMe ? '30d' : '7d' 
      }
    );

    return {
      accessToken,
      refreshToken,
      expiresIn: 15 * 60, // 15 минут в секундах
    };
  }

  async verifyTwoFactorCode(user: User, code: string): Promise<boolean> {
    // Здесь должна быть логика проверки TOTP кода
    // Для примера возвращаем true
    return true;
  }

  async getProfile(userId: string): Promise<Partial<User>> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    return user.toJSON();
  }

  async changePassword(userId: string, oldPassword: string, newPassword: string): Promise<void> {
    const user = await this.userModel.findByPk(userId);

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const isOldPasswordValid = await user.comparePassword(oldPassword);
    if (!isOldPasswordValid) {
      throw new BadRequestException('Неверный текущий пароль');
    }

    await user.update({ password: newPassword });
  }
}
