"use strict";
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.AudioService = void 0;
const common_1 = require("@nestjs/common");
const uuid_1 = require("uuid");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const pg_1 = require("pg");
const config_1 = require("@nestjs/config");
let AudioService = class AudioService {
    configService;
    client;
    baseUploadDir = (0, path_1.join)(process.cwd(), 'storage', 'audio');
    tempUploadDir = (0, path_1.join)(process.cwd(), 'uploads');
    allowedExtensions = /\.(mp3|wav|ogg|flac|aac)$/i;
    constructor(configService) {
        this.configService = configService;
        this.client = new pg_1.Client({
            host: this.configService.get('DB_HOST'),
            port: this.configService.get('DB_PORT'),
            user: this.configService.get('DB_USERNAME'),
            password: this.configService.get('DB_PASSWORD'),
            database: this.configService.get('DB_DATABASE'),
        });
        this.connectAndInitializeDatabase().catch((err) => console.error('Ошибка подключения и инициализации БД (AudioService):', err));
        (0, fs_extra_1.ensureDir)(this.baseUploadDir);
        (0, fs_extra_1.ensureDir)(this.tempUploadDir);
    }
    async connectAndInitializeDatabase() {
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
                console.log('Таблица "files" не найдена. Создаю таблицу (AudioService)...');
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
                console.log('Таблица "files" успешно создана (AudioService).');
            }
            else {
                console.log('Таблица "files" уже существует (AudioService).');
            }
        }
        catch (error) {
            console.error('Ошибка при подключении или проверке/создании таблицы (AudioService):', error);
            await this.client.end();
            throw error;
        }
    }
    async saveAudio(audio) {
        const fileExt = (0, path_1.extname)(audio.originalname).toLowerCase();
        if (!this.allowedExtensions.test(fileExt)) {
            throw new common_1.HttpException('Поддерживаются только аудиоформаты (mp3, wav, ogg, flac, aac)!', common_1.HttpStatus.BAD_REQUEST);
        }
        const uniqueFilename = `${(0, uuid_1.v4)()}${fileExt}`;
        const finalFilePath = (0, path_1.join)(this.baseUploadDir, uniqueFilename);
        const tempFilePath = (0, path_1.join)(this.tempUploadDir, audio.filename);
        try {
            await (0, fs_extra_1.writeFile)(finalFilePath, await (0, fs_extra_1.readFile)(tempFilePath));
            await (0, fs_extra_1.unlink)(tempFilePath);
            const result = await this.client.query(`
        INSERT INTO files (filename, original_name, mime_type, path, size, uploaded_at, file_type)
        VALUES ($1, $2, $3, $4, $5, NOW(), 'audio')
        RETURNING id, filename, original_name, mime_type, path, size, uploaded_at, file_type
        `, [uniqueFilename, audio.originalname, audio.mimetype, finalFilePath, audio.size]);
            return result.rows[0];
        }
        catch (error) {
            console.error('Ошибка сохранения аудио (AudioService):', error);
            throw new common_1.HttpException('Ошибка при сохранении аудио', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAllAudio() {
        try {
            const result = await this.client.query('SELECT id, filename, original_name, mime_type, path, size, uploaded_at FROM files WHERE file_type = $1', ['audio']);
            return result.rows;
        }
        catch (error) {
            console.error('Ошибка при получении списка аудио (AudioService):', error);
            throw new common_1.HttpException('Ошибка базы данных', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getAudioById(id) {
        try {
            const result = await this.client.query('SELECT path, original_name, mime_type FROM files WHERE id = $1 AND file_type = $2', [id, 'audio']);
            return result.rows[0] || null;
        }
        catch (error) {
            console.error('Ошибка при получении аудио по ID (AudioService):', error);
            throw new common_1.HttpException('Ошибка базы данных', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async onModuleDestroy() {
        await this.client.end();
    }
};
exports.AudioService = AudioService;
exports.AudioService = AudioService = __decorate([
    (0, common_1.Injectable)(),
    __metadata("design:paramtypes", [config_1.ConfigService])
], AudioService);
//# sourceMappingURL=audio.service.js.map