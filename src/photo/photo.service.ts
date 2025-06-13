import { Injectable, HttpException, HttpStatus, OnModuleDestroy } from '@nestjs/common';
import { v4 as uuidv4 } from 'uuid';
import { ensureDir, writeFile, readFile, unlink } from 'fs-extra';
import { join, extname } from 'path';
import { MulterFile } from '../interface/files.interface';
import { Client } from 'pg';
import { ConfigService } from '@nestjs/config';

@Injectable()
export class PhotoService implements OnModuleDestroy {
  private client: Client;
  private readonly baseUploadDir = join(process.cwd(), 'storage', 'images');
  private readonly tempUploadDir = join(process.cwd(), 'uploads');
  private readonly allowedExtensions = /\.(jpg|jpeg|png|gif|webp)$/i;

  constructor(private readonly configService: ConfigService) {
    this.client = new Client({
      host: this.configService.get<string>('DB_HOST'),
      port: this.configService.get<number>('DB_PORT'),
      user: this.configService.get<string>('DB_USERNAME'),
      password: this.configService.get<string>('DB_PASSWORD'),
      database: this.configService.get<string>('DB_DATABASE'),
    });

    this.connectAndInitializeDatabase().catch((err) => console.error('Ошибка подключения и инициализации БД (PhotoService):', err));
    ensureDir(this.baseUploadDir);
    ensureDir(this.tempUploadDir);
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
        console.log('Таблица "files" не найдена. Создаю таблицу (PhotoService)...');
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
        console.log('Таблица "files" успешно создана (PhotoService).');
      } else {
        console.log('Таблица "files" уже существует (PhotoService).');
      }
    } catch (error) {
      console.error('Ошибка при подключении или проверке/создании таблицы (PhotoService):', error);
      await this.client.end();
      throw error;
    }
  }

  async savePhoto(photo: MulterFile): Promise<any> {
    const fileExt = extname(photo.originalname).toLowerCase();
    if (!this.allowedExtensions.test(fileExt)) {
      throw new HttpException('Поддерживаются только изображения (jpg, jpeg, png, gif, webp)!', HttpStatus.BAD_REQUEST);
    }

    const uniqueFilename = `${uuidv4()}${fileExt}`;
    const finalFilePath = join(this.baseUploadDir, uniqueFilename);
    const tempFilePath = join(this.tempUploadDir, photo.filename);

    try {
      await writeFile(finalFilePath, await readFile(tempFilePath));
      await unlink(tempFilePath);
      const result = await this.client.query(
        `
        INSERT INTO files (filename, original_name, mime_type, path, size, uploaded_at, file_type)
        VALUES ($1, $2, $3, $4, $5, NOW(), 'images')
        RETURNING id, filename, original_name, mime_type, path, size, uploaded_at, file_type
        `,
        [uniqueFilename, photo.originalname, photo.mimetype, finalFilePath, photo.size],
      );
      return result.rows[0];
    } catch (error) {
      console.error('Ошибка сохранения изображения (PhotoService):', error);
      throw new HttpException('Ошибка при сохранении изображения', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getAllPhotos(): Promise<any[]> {
    try {
      const result = await this.client.query(
        'SELECT id, filename, original_name, mime_type, path, size, uploaded_at FROM files WHERE file_type = $1',
        ['images'],
      );
      return result.rows;
    } catch (error) {
      console.error('Ошибка при получении списка фото (PhotoService):', error);
      throw new HttpException('Ошибка базы данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async getPhotoById(id: string): Promise<any | null> {
    try {
      const result = await this.client.query(
        'SELECT path, original_name, mime_type FROM files WHERE id = $1 AND file_type = $2',
        [id, 'images'],
      );
      return result.rows[0] || null;
    } catch (error) {
      console.error('Ошибка при получении фото по ID (PhotoService):', error);
      throw new HttpException('Ошибка базы данных', HttpStatus.INTERNAL_SERVER_ERROR);
    }
  }

  async onModuleDestroy() {
    await this.client.end();
  }
}