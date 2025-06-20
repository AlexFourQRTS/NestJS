# 🔐 Система авторизации и регистрации

Полноценная система авторизации с JWT токенами, ролями и двухфакторной аутентификацией.

## 📋 Возможности

- ✅ **Регистрация пользователей** с валидацией
- ✅ **Авторизация** с JWT токенами
- ✅ **Refresh токены** для обновления сессий
- ✅ **Роли пользователей** (USER, ADMIN, MODERATOR)
- ✅ **Двухфакторная аутентификация** (2FA)
- ✅ **Верификация email**
- ✅ **Сброс пароля**
- ✅ **Защита от DDoS** (через middleware)
- ✅ **Логирование** важных событий

## 🚀 API Эндпоинты

### Регистрация и авторизация

```bash
# Регистрация
POST /api/auth/register
{
  "email": "user@example.com",
  "name": "John Doe",
  "password": "SecurePass123!",
  "confirmPassword": "SecurePass123!"
}

# Авторизация
POST /api/auth/login
{
  "email": "user@example.com",
  "password": "SecurePass123!",
  "twoFactorCode": "123456",  // опционально
  "rememberMe": "true"        // опционально
}

# Обновление токенов
POST /api/auth/refresh
{
  "refreshToken": "your-refresh-token"
}

# Выход из системы
POST /api/auth/logout
{
  "refreshToken": "your-refresh-token"
}
```

### Профиль и управление

```bash
# Получить профиль (требует авторизации)
GET /api/auth/profile
Authorization: Bearer your-access-token

# Изменить пароль (требует авторизации)
POST /api/auth/change-password
Authorization: Bearer your-access-token
{
  "oldPassword": "old-password",
  "newPassword": "new-password"
}

# Список пользователей (только для админов)
GET /api/auth/admin/users
Authorization: Bearer your-access-token
```

## 🛡️ Безопасность

### Пароли
- Минимум 8 символов
- Должен содержать: строчную букву, заглавную букву, цифру и специальный символ
- Хеширование с bcrypt (12 раундов)

### JWT Токены
- **Access Token**: 15 минут
- **Refresh Token**: 7 дней (или 30 дней с "Remember Me")
- Автоматическое отзывание токенов при выходе

### Роли
- **USER**: Обычный пользователь
- **MODERATOR**: Модератор
- **ADMIN**: Администратор

## 📊 Структура базы данных

### Таблица `users`
```sql
CREATE TABLE users (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  email VARCHAR UNIQUE NOT NULL,
  password VARCHAR NOT NULL,
  name VARCHAR NOT NULL,
  role user_role DEFAULT 'user',
  is_email_verified BOOLEAN DEFAULT false,
  email_verification_token VARCHAR,
  password_reset_token VARCHAR,
  password_reset_expires TIMESTAMP,
  two_factor_secret VARCHAR,
  is_two_factor_enabled BOOLEAN DEFAULT false,
  is_active BOOLEAN DEFAULT true,
  last_login_at TIMESTAMP,
  last_login_ip VARCHAR,
  created_at TIMESTAMP DEFAULT NOW(),
  updated_at TIMESTAMP DEFAULT NOW()
);
```

## 🔧 Настройка

### 1. Переменные окружения
Создайте файл `.env` в корне проекта:

```env
# JWT Configuration
JWT_SECRET=your-super-secret-jwt-key-change-this-in-production
JWT_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d

# Database Configuration
DB_HOST=localhost
DB_PORT=5432
DB_USERNAME=postgres
DB_PASSWORD=password
DB_DATABASE=nestjs_db

# Server Configuration
PORT=5000
NODE_ENV=development

# Security
BCRYPT_ROUNDS=12
```

### 2. Миграции
```bash
# Создать миграцию
npm run migration:generate -- src/migrations/CreateUsersTable

# Запустить миграции
npm run migration:run
```

## 🎯 Использование Guards

### Защита маршрутов
```typescript
@Controller('protected')
@UseGuards(JwtAuthGuard)
export class ProtectedController {
  @Get()
  getProtectedData() {
    return 'This is protected data';
  }
}
```

### Проверка ролей
```typescript
@Controller('admin')
@UseGuards(JwtAuthGuard, RolesGuard)
export class AdminController {
  @Get('users')
  @Roles(UserRole.ADMIN)
  getUsers() {
    return 'Admin only';
  }
}
```

## 📝 Примеры использования

### Регистрация нового пользователя
```typescript
const response = await fetch('/api/auth/register', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    name: 'John Doe',
    password: 'SecurePass123!',
    confirmPassword: 'SecurePass123!'
  })
});

const { user, tokens } = await response.json();
```

### Авторизация
```typescript
const response = await fetch('/api/auth/login', {
  method: 'POST',
  headers: { 'Content-Type': 'application/json' },
  body: JSON.stringify({
    email: 'user@example.com',
    password: 'SecurePass123!'
  })
});

const { user, tokens } = await response.json();
localStorage.setItem('accessToken', tokens.accessToken);
localStorage.setItem('refreshToken', tokens.refreshToken);
```

### Защищенные запросы
```typescript
const response = await fetch('/api/auth/profile', {
  headers: {
    'Authorization': `Bearer ${localStorage.getItem('accessToken')}`
  }
});
```

## 🔄 Обновление токенов

```typescript
async function refreshTokens() {
  const refreshToken = localStorage.getItem('refreshToken');
  
  const response = await fetch('/api/auth/refresh', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refreshToken })
  });

  if (response.ok) {
    const { accessToken, refreshToken: newRefreshToken } = await response.json();
    localStorage.setItem('accessToken', accessToken);
    localStorage.setItem('refreshToken', newRefreshToken);
  } else {
    // Токен истек, перенаправляем на логин
    localStorage.removeItem('accessToken');
    localStorage.removeItem('refreshToken');
    window.location.href = '/login';
  }
}
```

## 🚨 Безопасность

1. **Всегда используйте HTTPS** в продакшене
2. **Измените JWT_SECRET** на уникальный ключ
3. **Настройте rate limiting** для защиты от брутфорса
4. **Логируйте** важные события безопасности
5. **Регулярно обновляйте** зависимости
6. **Используйте strong passwords** политику
7. **Включите 2FA** для критических операций

## 📚 Дополнительные возможности

- [ ] Email верификация
- [ ] Сброс пароля через email
- [ ] Социальная авторизация (Google, GitHub)
- [ ] Аудит действий пользователей
- [ ] Автоматическая блокировка при подозрительной активности
- [ ] Уведомления о входе в аккаунт 