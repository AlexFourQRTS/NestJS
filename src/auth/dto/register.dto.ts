import { IsEmail, IsString, MinLength, MaxLength, Matches, IsOptional } from 'class-validator';

export class RegisterDto {
  @IsEmail({}, { message: 'Пожалуйста, введите корректный email' })
  email: string;

  @IsString({ message: 'Имя должно быть строкой' })
  @MinLength(2, { message: 'Имя должно содержать минимум 2 символа' })
  @MaxLength(50, { message: 'Имя не должно превышать 50 символов' })
  name: string;

  @IsString({ message: 'Пароль должен быть строкой' })
  @MinLength(8, { message: 'Пароль должен содержать минимум 8 символов' })
  @MaxLength(128, { message: 'Пароль не должен превышать 128 символов' })
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]/,
    {
      message: 'Пароль должен содержать: строчную букву, заглавную букву, цифру и специальный символ'
    }
  )
  password: string;

  @IsString({ message: 'Подтверждение пароля должно быть строкой' })
  confirmPassword: string;

  @IsOptional()
  @IsString({ message: 'Пригласительный код должен быть строкой' })
  inviteCode?: string;
} 