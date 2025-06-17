import { Controller, Post, Get, Param, UseInterceptors, UploadedFiles, BadRequestException, HttpStatus, HttpException, Res, Req, Delete } from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { diskStorage, memoryStorage } from 'multer';
import { extname, join } from 'path'; 

import { Response, Request } from 'express'; // Добавьте Request

import { MulterFile } from '../interface/files.interface';
import { FilesService } from './files.service';

import * as fs from 'fs'; // Импортируйте модуль fs
import { promisify } from 'util'; // Импортируйте promisify

const stat = promisify(fs.stat);

@Controller('files')
export class FilesController {
  constructor(private readonly filesService: FilesService) { }

  @Get()
  async getAllFiles() {
    try {
      const groupedFiles = await this.filesService.getAllFiles();

      // Преобразуем каждую группу файлов, добавляя URL
      const result = {

        images: groupedFiles.images.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/number${file.id}/download`
        })),

        videos: groupedFiles.videos.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/number${file.id}/download`
        })),

        audio: groupedFiles.audio.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/number${file.id}/download`
        })),

        documents: groupedFiles.documents.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/number${file.id}/download`
        })),

        other: groupedFiles.other.map(file => ({
          ...file,
          url: `/api/files/${file.file_type}/${file.filename}`,
          downloadUrl: `/api/files/number${file.id}/download`
        }))
      };

      return result;
    } catch (error) {
      console.error('Ошибка при получении списка файлов:', error);
      throw new HttpException('Ошибка при получении списка файлов', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  @Get('number:id')
  async getFileById(@Param('id') id: string) {

    try {
      const file = await this.filesService.getFileById(id);
      if (!file) {
        throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
      }
      return {
        ...file,
        url: `/api/files/${file.file_type}/${file.filename}`,
        downloadUrl: `/api/files/number${file.id}/download`
      };
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при получении информации о файле:', error);
      throw new HttpException('Ошибка при получении информации о файле', HttpStatus.INTERNAL_SERVER_ERROR);
    }

  }

  @Get('number:id/download')
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

  @Delete('number:id')
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
          downloadUrl: `/api/files/number${file.id}/download`
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



  @Get('stream/:id')
  async streamVideo(@Param('id') id: string, @Req() req: Request, @Res() res: Response) {
    try {
      const file = await this.filesService.getFileById(id);

       if (!file) {
      throw new HttpException('Файл не найден', HttpStatus.NOT_FOUND);
    }

    if (file.file_type !== 'videos' && !file.mime_type.startsWith('video/')) {
       console.log('Debug: File failed video type check.');
       throw new HttpException('Запрашиваемый файл не является видео', HttpStatus.BAD_REQUEST);
    }

  console.log("Статистика по видео : ", file.original_name )

      const videoPath = file.path;
      const videoStat = await stat(videoPath);
      const fileSize = videoStat.size;
      const range = req.headers.range;

      if (range) {
        const parts = range.replace(/bytes=/, "").split("-");
        const start = parseInt(parts[0], 10);
        const end = parts[1] ? parseInt(parts[1], 10) : fileSize - 1;

        const chunksize = (end - start) + 1;
        const fileStream = fs.createReadStream(videoPath, { start, end });
        const head = {
          'Content-Range': `bytes ${start}-${end}/${fileSize}`,
          'Accept-Ranges': 'bytes',
          'Content-Length': chunksize,
          'Content-Type': file.mime_type, // Используйте MIME-тип файла из БД
        };

        res.writeHead(HttpStatus.PARTIAL_CONTENT, head);
        fileStream.pipe(res);
      } else {
        const head = {
          'Content-Length': fileSize,
          'Content-Type': file.mime_type, // Используйте MIME-тип файла из БД
        };
        res.writeHead(HttpStatus.OK, head);
        fs.createReadStream(videoPath).pipe(res);
      }
    } catch (error) {
      if (error instanceof HttpException) {
        throw error;
      }
      console.error('Ошибка при потоковой передаче видео:', error);
      throw new HttpException('Ошибка при потоковой передаче видео', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  // -------------------------------------------------------------------------------------------
  // Hyss-Setup-0.1.0.exe
  @Get('Hyss-Setup-0.1.0.exe')
  async downloadHyssSetupExe(@Res() res: Response) {
    try {
      const filePath = join(process.cwd(), '/Hyss-Setup-0.1.0.exe');
      const fileName = 'Hyss-Setup-0.1.0.exe';
      res.download(filePath, fileName, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          if (err.code === 'ENOENT') {
            console.warn(`Файл не найден для скачивания: ${filePath}`);
            res.status(HttpStatus.NOT_FOUND).send('Файл Hyss-Setup-0.1.0.exe не найден.');
          } else {
            console.error('Ошибка при скачивании Hyss-Setup-0.1.0.exe:', err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Не удалось скачать файл Hyss-Setup-0.1.0.exe.');
          }
        }
      });
    } catch (error) {
      console.error('Непредвиденная ошибка в downloadHyssSetupExe (вне коллбэка download):', error);
      throw new HttpException('Произошла непредвиденная ошибка.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }
  // Hyss-Setup-0.1.0.exe/riot.txt
  @Get('Hyss-Setup-0.1.0.exe/riot.txt')
  async downloadRiotTxt(@Res() res: Response) {
    try {
      const filePath = join(process.cwd(), '/riot.txt');
      const fileName = 'riot.txt';
      res.download(filePath, fileName, (err: NodeJS.ErrnoException | null) => {
        if (err) {
          if (err.code === 'ENOENT') {
            console.warn(`Файл не найден для скачивания: ${filePath}`);
            res.status(HttpStatus.NOT_FOUND).send('Файл riot.txt не найден.');
          } else {
            console.error('Ошибка при скачивании riot.txt:', err);
            res.status(HttpStatus.INTERNAL_SERVER_ERROR).send('Не удалось скачать файл riot.txt.');
          }
        }
      });
    } catch (error) {
      console.error('Непредвиденная ошибка в downloadRiotTxt (вне коллбэка download):', error);
      throw new HttpException('Произошла непредвиденная ошибка.', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

}

