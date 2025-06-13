import { Controller, Post, Get, Param, UseInterceptors, UploadedFiles, BadRequestException, HttpStatus, HttpException, Res, Delete } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname } from 'path';
import { Response } from 'express';
import { MulterFile } from '../interface/files.interface';
import { FilesService } from './files.service';

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) {}

  @Get()
  async getAllFiles() {
    try {
      const groupedFiles = await this.filesService.getAllFiles();
      
      // Преобразуем каждую группу файлов, добавляя URL
      const result = {
        images: groupedFiles.images.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/${file.id}/download`
        })),
        videos: groupedFiles.videos.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/${file.id}/download`
        })),
        audio: groupedFiles.audio.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/${file.id}/download`
        })),
        documents: groupedFiles.documents.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/${file.id}/download`
        })),
        other: groupedFiles.other.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/${file.id}/download`
        }))
      };

      return result;
    } catch (error) {
      console.error('Ошибка при получении списка файлов:', error);
      throw new HttpException('Ошибка при получении списка файлов', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id')
  async getFileById(@Param('id') id: string) {
    try {
      const file = await this.filesService.getFileById(id);
      if (!file) {
        throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
      }
      return {
        ...file,
        url: `/api/files/${file.file_type}/${file.filename}`,
        downloadUrl: `/api/files/${file.id}/download`
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при получении информации о файле:', error);
      throw new HttpException('Ошибка при получении информации о файле', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get(':id/download')
  async downloadFile(@Param('id') id: string, @Res() res: Response) {
    try {
      const file = await this.filesService.getFileById(id);
      if (!file) {
        throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
      }

      const filePath = file.path;
      res.download(filePath, file.original_name);
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при скачивании файла:', error);
      throw new HttpException('Ошибка при скачивании файла', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Delete(':id')
  async deleteFile(@Param('id') id: string) {
    try {
      await this.filesService.deleteFile(id);
      return {
        message: 'File deleted successfully',
        status: 'success'
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Error deleting file:', error);
      throw new HttpException('Error deleting file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Post('upload')
  @UseInterceptors(
    FileFieldsInterceptor(
      [{ name: 'files', maxCount: 10 }],
      {
        storage: memoryStorage(),
        limits: {
          fileSize: 6000 * 1024 * 1024, // 6GB
        },
      },
    ),
  )
  async uploadFiles(@UploadedFiles() files: { files?: MulterFile[] }) {
    if (!files?.files || files.files.length === 0) {
      throw new BadRequestException('Пожалуйста, загрузите файлы!');
    }

    try {
      const fileDetails = await this.filesService.saveFiles(files.files);
      return {
        message: 'Файлы успешно загружены!',
        data: fileDetails.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/${file.id}/download`
        }))
      };
    } catch (error) {
      console.error('Ошибка при загрузке файлов:', error);
      if (error instanceof HttpException) {
        throw error;
      } else {
        throw new HttpException('Ошибка при обработке файлов на сервере', HttpStatus.INTERNAL_SERVER_ERROR);
      }
    }
  }
}