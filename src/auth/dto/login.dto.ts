import { IsEmail, IsString, IsOptional } from 'class-validator';

export class LoginDto {
  @IsEmail({}, { message: 'Пожалуйста, введите корректный email' })
  email: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  password: string;

  @IsOptional()
  @IsString({ message: 'Код двухфакторной аутентификации должен быть строкой' })
  twoFactorCode?: string;

  @IsOptional()
  @IsString({ message: 'Remember me должен быть строкой' })
  rememberMe?: string;
} 