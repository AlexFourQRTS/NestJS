import { Module } from '@nestjs/common';
import { ThinkService } from './think.service';
import { ThinkController } from './think.controller';

@Module({
  controllers: [ThinkController],
  providers: [ThinkService],
})
export class ThinkModule {}
