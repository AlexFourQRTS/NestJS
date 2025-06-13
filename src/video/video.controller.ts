import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MulterFile } from '../interface/files.interface';
import { VideoService } from './video.service';
import { Response } from 'express';

@Controller('video')
export class VideoController {
  constructor(private readonly videoService: VideoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('video', { // Имя поля 'video' должно совпадать с formData.append на фронтенде
      storage: diskStorage({
        destination: './uploads', // Временная папка
        filename: (req, file, callback) => {
          const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
          const ext = extname(file.originalname);
          const filename = `${file.originalname.replace(ext, '')}-${uniqueSuffix}${ext}`;
          callback(null, filename);
        },
      }),
      limits: {
        fileSize: 2 * 6000 * 1024 * 1024, // 12GB (увеличим лимит для видео)
      },
    }),
  )
  async uploadVideo(@UploadedFile() video: MulterFile) {
    if (!video) {
      throw new BadRequestException('Пожалуйста, загрузите видео!');
    }
    const fileDetails = await this.videoService.saveVideo(video);
    return { message: 'Видео успешно загружено!', data: fileDetails };
  }

  @Get()
  async getVideos() {
    return await this.videoService.getAllVideos();
  }

  @Get(':id')
  async downloadVideo(@Param('id') id: string, @Res() res: Response) {
    try {
      const videoInfo = await this.videoService.getVideoById(id);
      if (!videoInfo) {
        throw new HttpException('Видео не найдено', HttpStatus.NOT_FOUND);
      }
      res.sendFile(videoInfo.path);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка сервера при скачивании видео', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}