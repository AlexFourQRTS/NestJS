import { Module } from '@nestjs/common';
import { PhotoController } from './photo.controller';
import { PhotoService } from './photo.service';
import { ConfigModule } from '@nestjs/config'; // Импортируйте ConfigModule

@Module({
  imports: [ConfigModule], // Добавьте ConfigModule в imports
  controllers: [PhotoController],
  providers: [PhotoService],
})
export class PhotoModule {}