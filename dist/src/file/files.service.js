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
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesService = void 0;
const common_1 = require("@nestjs/common");
const fs_extra_1 = require("fs-extra");
const path_1 = require("path");
const pg_1 = require("pg");
const config_1 = require("@nestjs/config");
const typeorm_1 = require("@nestjs/typeorm");
const typeorm_2 = require("typeorm");
const file_entity_1 = require("./entities/file.entity");
let FilesService = class FilesService {
    configService;
    filesRepository;
    client;
    imageExtensions = /\.(jpg|jpeg|png|gif|webp|svg)$/i;
    videoExtensions = /\.(mp4|webm|mov|avi|mkv)$/i;
    audioExtensions = /\.(mp3|wav|ogg|flac|m4a)$/i;
    documentExtensions = /\.(pdf|doc|docx|xls|xlsx|ppt|pptx|txt|rtf)$/i;
    baseUploadDir = (0, path_1.join)(process.cwd(), 'CloudFile');
    typeDirs = {
        images: (0, path_1.join)(this.baseUploadDir, 'Images'),
        videos: (0, path_1.join)(this.baseUploadDir, 'Video'),
        audio: (0, path_1.join)(this.baseUploadDir, 'Musik'),
        documents: (0, path_1.join)(this.baseUploadDir, 'Document'),
        other: (0, path_1.join)(this.baseUploadDir, 'Other')
    };
    constructor(configService, filesRepository) {
        this.configService = configService;
        this.filesRepository = filesRepository;
        this.client = new pg_1.Client({
            host: this.configService.get('DB_HOST'),
            port: this.configService.get('DB_PORT'),
            user: this.configService.get('DB_USERNAME'),
            password: this.configService.get('DB_PASSWORD'),
            database: this.configService.get('DB_DATABASE'),
        });
        this.connectAndInitializeDatabase().catch((err) => console.error('Ошибка подключения и инициализации базы данных:', err));
        this.initializeDirectories();
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
            }
            else {
                console.log('Таблица "files" уже существует.');
            }
        }
        catch (error) {
            console.error('Ошибка при подключении или проверке/создании таблицы:', error);
            await this.client.end();
            throw error;
        }
    }
    async initializeDirectories() {
        try {
            await (0, fs_extra_1.ensureDir)(this.baseUploadDir);
            for (const dir of Object.values(this.typeDirs)) {
                await (0, fs_extra_1.ensureDir)(dir);
            }
        }
        catch (error) {
            console.error('Ошибка при создании директорий:', error);
            throw error;
        }
    }
    determineFileType(filename) {
        const ext = (0, path_1.extname)(filename).toLowerCase();
        if (this.imageExtensions.test(ext))
            return 'images';
        if (this.videoExtensions.test(ext))
            return 'videos';
        if (this.audioExtensions.test(ext))
            return 'audio';
        if (this.documentExtensions.test(ext))
            return 'documents';
        return 'other';
    }
    getUploadPath(fileType, filename) {
        const typeDir = this.typeDirs[fileType] || this.typeDirs.other;
        return (0, path_1.join)(typeDir, filename);
    }
    async getAllFiles() {
        const files = await this.filesRepository.find();
        const groupedFiles = {
            images: files.filter(file => file.file_type === 'images'),
            videos: files.filter(file => file.file_type === 'videos'),
            audio: files.filter(file => file.file_type === 'audio'),
            documents: files.filter(file => file.file_type === 'documents'),
            other: files.filter(file => file.file_type === 'other')
        };
        return groupedFiles;
    }
    async getFileById(id) {
        const file = await this.filesRepository.findOne({ where: { id } });
        if (!file) {
            throw new common_1.HttpException('File not found', common_1.HttpStatus.NOT_FOUND);
        }
        return file;
    }
    async saveFiles(files) {
        try {
            const fileEntities = await Promise.all(files.map(async (file) => {
                const fileType = this.determineFileType(file.originalname);
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                const filename = `${file.originalname.replace(ext, '')}-${uniqueSuffix}${ext}`;
                const uploadPath = this.getUploadPath(fileType, filename);
                await (0, fs_extra_1.writeFile)(uploadPath, file.buffer);
                const fileEntity = new file_entity_1.File();
                fileEntity.filename = filename;
                fileEntity.original_name = file.originalname;
                fileEntity.mime_type = file.mimetype;
                fileEntity.size = file.size;
                fileEntity.path = uploadPath;
                fileEntity.file_type = fileType;
                return fileEntity;
            }));
            return await this.filesRepository.save(fileEntities);
        }
        catch (error) {
            console.error('Error saving files:', error);
            throw new common_1.HttpException('Error saving files', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteFile(id) {
        try {
            const file = await this.getFileById(id);
            if (!file) {
                throw new common_1.NotFoundException('File not found');
            }
            try {
                await (0, fs_extra_1.unlink)(file.path);
            }
            catch (error) {
                console.error('Error deleting physical file:', error);
            }
            await this.filesRepository.remove(file);
        }
        catch (error) {
            if (error instanceof common_1.NotFoundException) {
                throw error;
            }
            console.error('Error deleting file:', error);
            throw new common_1.HttpException('Error deleting file', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async onModuleDestroy() {
        await this.client.end();
    }
};
exports.FilesService = FilesService;
exports.FilesService = FilesService = __decorate([
    (0, common_1.Injectable)(),
    __param(1, (0, typeorm_1.InjectRepository)(file_entity_1.File)),
    __metadata("design:paramtypes", [config_1.ConfigService,
        typeorm_2.Repository])
], FilesService);
//# sourceMappingURL=files.service.js.map