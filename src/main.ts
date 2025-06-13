import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { NotFoundFilter } from './filters/not-found.filter';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);
  
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

  // Регистрация глобального фильтра для 404 ошибок
  app.useGlobalFilters(new NotFoundFilter());

  await app.listen(process.env.PORT ?? 5000);
}
bootstrap();