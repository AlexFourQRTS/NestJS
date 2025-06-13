import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MulterFile } from '../interface/files.interface'
import { AudioService } from './audio.service';
import { Response } from 'express';

@Controller('audio')
export class AudioController {
  constructor(private readonly audioService: AudioService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('audio', { // Имя поля 'audio' должно совпадать с formData.append на фронтенде
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
        fileSize: 100 * 1024 * 1024, // 100MB (или другой лимит)
      },
    }),
  )
  async uploadAudio(@UploadedFile() audio: MulterFile) {
    if (!audio) {
      throw new BadRequestException('Пожалуйста, загрузите аудио!');
    }
    const fileDetails = await this.audioService.saveAudio(audio);
    return { message: 'Аудио успешно загружено!', data: fileDetails };
  }

  @Get()
  async getAudio() {
    return await this.audioService.getAllAudio();
  }

  @Get(':id')
  async downloadAudio(@Param('id') id: string, @Res() res: Response) {
    try {
      const audioInfo = await this.audioService.getAudioById(id);
      if (!audioInfo) {
        throw new HttpException('Аудио не найдено', HttpStatus.NOT_FOUND);
      }
      res.sendFile(audioInfo.path);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка сервера при скачивании аудио', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}