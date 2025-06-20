import { 
  Controller, 
  Post, 
  Get, 
  Body, 
  UseGuards, 
  Request, 
  HttpCode, 
  HttpStatus,
  BadRequestException
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBody, 
  ApiBearerAuth,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';
import { RefreshTokenDto } from './dto/refresh-token.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { LocalAuthGuard } from './guards/local-auth.guard';
import { RolesGuard, Roles } from './guards/roles.guard';
import { User, UserRole } from './entities/User.model';

@ApiTags('auth')
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Регистрация нового пользователя' })
  @ApiBody({ type: RegisterDto })
  @ApiResponse({ 
    status: 201, 
    description: 'Пользователь успешно зарегистрирован',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            isActive: { type: 'boolean' },
            isTwoFactorEnabled: { type: 'boolean' }
          }
        },
        tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiConflictResponse({ description: 'Пользователь с таким email уже существует' })
  @ApiBadRequestResponse({ description: 'Неверные данные для регистрации' })
  async register(@Body() registerDto: RegisterDto): Promise<{ user: Partial<User>; tokens: any }> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Вход в систему' })
  @ApiBody({ type: LoginDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Успешный вход в систему',
    schema: {
      type: 'object',
      properties: {
        user: {
          type: 'object',
          properties: {
            id: { type: 'string' },
            email: { type: 'string' },
            name: { type: 'string' },
            role: { type: 'string' },
            isActive: { type: 'boolean' },
            isTwoFactorEnabled: { type: 'boolean' }
          }
        },
        tokens: {
          type: 'object',
          properties: {
            accessToken: { type: 'string' },
            refreshToken: { type: 'string' },
            expiresIn: { type: 'number' }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Неверный email или пароль' })
  async login(@Body() loginDto: LoginDto, @Request() req: any): Promise<{ user: Partial<User>; tokens: any }> {
    const clientIP = this.getClientIP(req);
    return this.authService.login(loginDto, clientIP);
  }

  @Post('refresh')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ summary: 'Обновление токенов' })
  @ApiBody({ type: RefreshTokenDto })
  @ApiResponse({ 
    status: 200, 
    description: 'Токены успешно обновлены',
    schema: {
      type: 'object',
      properties: {
        accessToken: { type: 'string' },
        refreshToken: { type: 'string' },
        expiresIn: { type: 'number' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Неверный refresh token' })
  async refreshTokens(@Body() refreshTokenDto: RefreshTokenDto) {
    return this.authService.refreshTokens(refreshTokenDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Выход из системы' })
  @ApiResponse({ status: 200, description: 'Успешный выход из системы' })
  @ApiUnauthorizedResponse({ description: 'Неавторизованный доступ' })
  async logout(@Body() body: { refreshToken: string }) {
    await this.authService.logout(body.refreshToken);
    return { message: 'Успешный выход из системы' };
  }

  @Get('profile')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение профиля пользователя' })
  @ApiResponse({ 
    status: 200, 
    description: 'Профиль пользователя',
    schema: {
      type: 'object',
      properties: {
        id: { type: 'string' },
        email: { type: 'string' },
        name: { type: 'string' },
        role: { type: 'string' },
        isActive: { type: 'boolean' },
        isTwoFactorEnabled: { type: 'boolean' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Неавторизованный доступ' })
  async getProfile(@Request() req: any): Promise<Partial<User>> {
    return this.authService.getProfile(req.user.id);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @HttpCode(HttpStatus.OK)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Изменение пароля' })
  @ApiResponse({ status: 200, description: 'Пароль успешно изменен' })
  @ApiUnauthorizedResponse({ description: 'Неавторизованный доступ' })
  @ApiBadRequestResponse({ description: 'Неверный текущий пароль' })
  async changePassword(
    @Request() req: any,
    @Body() body: { oldPassword: string; newPassword: string }
  ) {
    if (!body.oldPassword || !body.newPassword) {
      throw new BadRequestException('Необходимо указать старый и новый пароль');
    }

    await this.authService.changePassword(
      req.user.id,
      body.oldPassword,
      body.newPassword
    );

    return { message: 'Пароль успешно изменен' };
  }

  @Get('admin/users')
  @UseGuards(JwtAuthGuard, RolesGuard)
  @Roles(UserRole.ADMIN)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ summary: 'Получение списка пользователей (только для админов)' })
  @ApiResponse({ status: 200, description: 'Список пользователей' })
  @ApiUnauthorizedResponse({ description: 'Неавторизованный доступ' })
  async getUsers() {
    // Здесь должна быть логика получения всех пользователей
    return { message: 'Список пользователей (только для админов)' };
  }

  private getClientIP(req: any): string {
    const forwarded = req.headers['x-forwarded-for'];
    const realIP = req.headers['x-real-ip'];
    
    if (typeof forwarded === 'string') {
      return forwarded.split(',')[0].trim();
    }
    
    if (typeof realIP === 'string') {
      return realIP;
    }
    
    return req.connection.remoteAddress || req.socket.remoteAddress || 'unknown';
  }
}
