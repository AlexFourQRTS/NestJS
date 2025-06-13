import { Module } from '@nestjs/common';
import { VideoController } from './video.controller';
import { VideoService } from './video.service';
import { ConfigModule } from '@nestjs/config'; // Импортируйте ConfigModule

@Module({
  imports: [ConfigModule], // Добавьте ConfigModule в imports
  controllers: [VideoController],
  providers: [VideoService],
})
export class VideoModule {}