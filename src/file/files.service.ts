import { Injectable, OnModuleDestroy, BadRequestException, NotFoundException, HttpException, HttpStatus } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ensureDir, writeFile, readFile, unlink } from 'fs-extra';
import { join, extname } from 'path';
import { MulterFile } from '../interface/files.interface';
import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';

@Injectable()
export class FilesService implements OnModuleDestroy {
  private client: Client;

  private readonly imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
  private readonly videoExtensions = /\.(mp4|webm|mov|avi|mkv)$/i;
  private readonly audioExtensions = /\.(mp3|wav|ogg|flac|m4a)$/i;
  private readonly documentExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/i;
  
  private readonly baseUploadDir = join(process.cwd(), 'CloudFile');
  private readonly typeDirs = {
    images: join(this.baseUploadDir, 'Images'),
    videos: join(this.baseUploadDir, 'Video'),
    audio: join(this.baseUploadDir, 'Musik'),
    documents: join(this.baseUploadDir, 'Document'),
    other: join(this.baseUploadDir, 'Other')
  };

  constructor(
    private readonly configService: ConfigService,
    @InjectRepository(File)
    private filesRepository: Repository<File>,
  ) {
    this.client = new Client({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
    });

    this.connectAndInitializeDatabase().catch((err) => console.error('Ошибка подключения и инициализации базы данных:', err));
    this.initializeDirectories();
  }

  private async connectAndInitializeDatabase() {
    try {
      await this.client.connect();
      const checkTableResult = await this.client.query(`
        SELECT EXISTS (
          SELECT FROM pg_tables
          WHERE schemaname = 'public'
          AND tablename  = 'files'
        );
      `);

      if (!checkTableResult.rows[0].exists) {
        console.log('Таблица "files" не найдена. Создаю таблицу...');
        await this.client.query(`
          CREATE TABLE files (
            id SERIAL PRIMARY KEY,
            filename VARCHAR(255) NOT NULL,
            original_name VARCHAR(255) NOT NULL,
            mime_type VARCHAR(255) NOT NULL,
            path VARCHAR(255) NOT NULL,
            size BIGINT NOT NULL,
            uploaded_at TIMESTAMP NOT NULL DEFAULT NOW(),
            file_type VARCHAR(50) NOT NULL
          );
        `);
        console.log('Таблица "files" успешно создана.');
      } else {
        console.log('Таблица "files" уже существует.');
      }
    } catch (error) {
      console.error('Ошибка при подключении или проверке/создании таблицы:', error);
      await this.client.end();
      throw error;
    }
  }

  private async initializeDirectories() {
    try {
      // Создаем основную директорию
      await ensureDir(this.baseUploadDir);
      
      // Создаем поддиректории для каждого типа файлов
      for (const dir of Object.values(this.typeDirs)) {
        await ensureDir(dir);
      }
    } catch (error) {
      console.error('Ошибка при создании директорий:', error);
      throw error;
    }
  }

  private determineFileType(filename: string): string {
    const ext = extname(filename).toLowerCase();
    if (this.imageExtensions.test(ext)) return 'images';
    if (this.videoExtensions.test(ext)) return 'videos';
    if (this.audioExtensions.test(ext)) return 'audio';
    if (this.documentExtensions.test(ext)) return 'documents';
    return 'other';
  }

  private getUploadPath(fileType: string, filename: string): string {
    const typeDir = this.typeDirs[fileType] || this.typeDirs.other;
    return join(typeDir, filename);
  }

  async getAllFiles(): Promise<{ [key: string]: File[] }> {
    const files = await this.filesRepository.find();
    
    // Группируем файлы по типам
    const groupedFiles = {
      images: files.filter(file => file.file_type === 'images'),
      videos: files.filter(file => file.file_type === 'videos'),
      audio: files.filter(file => file.file_type === 'audio'),
      documents: files.filter(file => file.file_type === 'documents'),
      other: files.filter(file => file.file_type === 'other')
    };

    return groupedFiles;
  }

  async getFileById(id: string): Promise<File> {
    const file = await this.filesRepository.findOne({ where: { id } });
    if (!file) {
      throw new HttpException('File not found', HttpStatus.NOT_FOUND);
    }
    return file;
  }

  async saveFiles(files: MulterFile[]): Promise<File[]> {
    try {
      const fileEntities = await Promise.all(files.map(async file => {
        const fileType = this.determineFileType(file.originalname);
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
        const ext = extname(file.originalname);
        const filename = `${file.originalname.replace(ext, '')}-${uniqueSuffix}${ext}`;
        
        // Определяем путь для сохранения файла
        const uploadPath = this.getUploadPath(fileType, filename);
        
        // Перемещаем файл в соответствующую директорию
        await writeFile(uploadPath, file.buffer);
        
        const fileEntity = new File();
        fileEntity.filename = filename;
        fileEntity.original_name = file.originalname;
        fileEntity.mime_type = file.mimetype;
        fileEntity.size = file.size;
        fileEntity.path = uploadPath;
        fileEntity.file_type = fileType;
        return fileEntity;
      }));

      return await this.filesRepository.save(fileEntities);
    } catch (error) {
      console.error('Error saving files:', error);
      throw new HttpException('Error saving files', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async deleteFile(id: string): Promise<void> {
    try {
      const file = await this.getFileById(id);
      if (!file) {
        throw new NotFoundException('File not found');
      }

      // Удаляем физический файл
      try {
        await unlink(file.path);
      } catch (error) {
        console.error('Error deleting physical file:', error);
        // Продолжаем выполнение даже если файл не найден
      }

      // Удаляем запись из базы данных
      await this.filesRepository.remove(file);
    } catch (error) {
      if (error instanceof NotFoundException) {
        throw error;
      }
      console.error('Error deleting file:', error);
      throw new HttpException('Error deleting file', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}