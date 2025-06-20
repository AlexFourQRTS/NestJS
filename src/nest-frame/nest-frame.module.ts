import { Module } from '@nestjs/common';
import { NestFrameService } from './nest-frame.service';
import { NestFrameController } from './nest-frame.controller';

@Module({
  controllers: [NestFrameController],
  providers: [NestFrameService],
})
export class NestFrameModule {}
