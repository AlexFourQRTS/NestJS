import { Controller, Post, UseInterceptors, UploadedFile, BadRequestException, Get, Param, Res, HttpStatus, HttpException } from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';
import { MulterFile } from '../interface/files.interface';
import { PhotoService } from './photo.service';
import { Response } from 'express';

@Controller('photo')
export class PhotoController {
  constructor(private readonly photoService: PhotoService) {}

  @Post('upload')
  @UseInterceptors(
    FileInterceptor('photo', { // Изменили 'files' на 'photo' и используем FileInterceptor для одного файла
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
        fileSize: 1000 * 1024 * 1024, // 1GB
      },
    }),
  )
  async uploadPhoto(@UploadedFile() photo: MulterFile) {
    if (!photo) {
      throw new BadRequestException('Пожалуйста, загрузите изображение!');
    }
    const fileDetails = await this.photoService.savePhoto(photo);
    return { message: 'Изображение успешно загружено!', data: fileDetails };
  }

  @Get()
  async getPhotos() {
    return await this.photoService.getAllPhotos();
  }

  @Get(':id')
  async downloadPhoto(@Param('id') id: string, @Res() res: Response) {
    try {
      const photoInfo = await this.photoService.getPhotoById(id);
      if (!photoInfo) {
        throw new HttpException('Изображение не найдено', HttpStatus.NOT_FOUND);
      }
      res.sendFile(photoInfo.path);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      throw new HttpException('Ошибка сервера при скачивании изображения', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
}