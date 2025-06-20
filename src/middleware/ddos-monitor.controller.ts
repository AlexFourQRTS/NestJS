import { Controller, Get, Delete, Param, Post, Body } from '@nestjs/common';
import { GlobalMiddleware } from './globalMiddleware';

@Controller('ddos-monitor')
export class DdosMonitorController {
  constructor(private readonly globalMiddleware: GlobalMiddleware) {}

  @Get('stats')
  getStats() {
    return {
      message: 'Статистика DDoS защиты с прогрессивным замедлением',
      data: this.globalMiddleware.getStats(),
      timestamp: new Date().toISOString(),
    };
  }

  @Get('ip/:ip')
  getIPInfo(@Param('ip') ip: string) {
    return {
      message: 'Информация о конкретном IP',
      data: this.globalMiddleware.getIPInfo(ip),
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('reset/:ip')
  resetIP(@Param('ip') ip: string) {
    const result = this.globalMiddleware.resetIP(ip);
    return {
      message: result ? 'Данные IP сброшены' : 'IP не найден в активных соединениях',
      ip: ip,
      reset: result,
      timestamp: new Date().toISOString(),
    };
  }

  @Delete('clear-all')
  clearAllData() {
    this.globalMiddleware.clearAllData();
    return {
      message: 'Все данные DDoS защиты очищены',
      timestamp: new Date().toISOString(),
    };
  }

  @Post('update-throttle-levels')
  updateThrottleLevels(@Body() newLevels: any) {
    try {
      this.globalMiddleware.updateThrottleLevels(newLevels);
      return {
        message: 'Уровни замедления обновлены',
        newLevels: newLevels,
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Ошибка при обновлении уровней замедления',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }

  @Get('throttle-levels')
  getThrottleLevels() {
    return {
      message: 'Текущие уровни замедления',
      levels: [
        {
          range: '0-50 запросов',
          delay: '0ms',
          description: 'Нормальная скорость'
        },
        {
          range: '51-75 запросов',
          delay: '1000ms (1 сек)',
          description: 'Легкое замедление'
        },
        {
          range: '76-100 запросов',
          delay: '3000ms (3 сек)',
          description: 'Среднее замедление'
        },
        {
          range: '101-150 запросов',
          delay: '5000ms (5 сек)',
          description: 'Сильное замедление'
        },
        {
          range: '151+ запросов',
          delay: '10000ms (10 сек)',
          description: 'Критическое замедление'
        }
      ],
      timestamp: new Date().toISOString(),
    };
  }

  @Get('excluded-paths')
  getExcludedPaths() {
    return {
      message: 'Список исключенных путей',
      excludedPaths: this.globalMiddleware.getExcludedPaths(),
      timestamp: new Date().toISOString(),
    };
  }

  @Post('add-excluded-path')
  addExcludedPath(@Body() body: { path: string }) {
    try {
      this.globalMiddleware.addExcludedPath(body.path);
      return {
        message: 'Путь добавлен в исключения',
        path: body.path,
        excludedPaths: this.globalMiddleware.getExcludedPaths(),
        timestamp: new Date().toISOString(),
      };
    } catch (error) {
      return {
        message: 'Ошибка при добавлении пути в исключения',
        error: error.message,
        timestamp: new Date().toISOString(),
      };
    }
  }
} 