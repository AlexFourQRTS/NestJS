import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { NotFoundFilter } from './filters/not-found.filter';
import { HttpExceptionFilter } from './common/filters/http-exception.filter';
import { GlobalMiddleware } from './middleware/globalMiddleware';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
  // Регистрация глобального middleware для защиты от DDoS - ПЕРВЫМ!
  const globalMiddleware = app.get(GlobalMiddleware);
  app.use(globalMiddleware.use.bind(globalMiddleware));
  
  // Настройка CORS
  app.enableCors({
    origin: true, // Разрешаем все источники, так как Nginx уже обрабатывает CORS
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization', 'Accept'],
    credentials: true,
    preflightContinue: false,
    optionsSuccessStatus: 204
  });

  // Настройка статических файлов
  app.useStaticAssets(join(__dirname, '..', 'storage'), {
    prefix: '/files/',
  });

  // Настройка временной директории для загрузки
  app.useStaticAssets(join(__dirname, '..', 'uploads'), {
    prefix: '/uploads/',
  });

  // Настройка префикса для API, исключая корневой маршрут
  app.setGlobalPrefix('api', {
    exclude: ['/'],
  });

  // Настройка Swagger документации
  const config = new DocumentBuilder()
    .setTitle('NestJS API')
    .setDescription('API документация для NestJS приложения')
    .setVersion('1.0')
    .addTag('auth', 'Авторизация и регистрация')
    .addTag('ddos-monitor', 'Мониторинг DDoS защиты')
    .addBearerAuth(
      {
        type: 'http',
        scheme: 'bearer',
        bearerFormat: 'JWT',
        name: 'JWT',
        description: 'Введите JWT токен',
        in: 'header',
      },
      'JWT-auth',
    )
    .build();
  
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api/docs', app, document);

  // Регистрация глобальных фильтров
  app.useGlobalFilters(new HttpExceptionFilter(), new NotFoundFilter());

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();