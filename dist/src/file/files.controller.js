"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __decorate = (this && this.__decorate) || function (decorators, target, key, desc) {
    var c = arguments.length, r = c < 3 ? target : desc === null ? desc = Object.getOwnPropertyDescriptor(target, key) : desc, d;
    if (typeof Reflect === "object" && typeof Reflect.decorate === "function") r = Reflect.decorate(decorators, target, key, desc);
    else for (var i = decorators.length - 1; i >= 0; i--) if (d = decorators[i]) r = (c < 3 ? d(r) : c > 3 ? d(target, key, r) : d(target, key)) || r;
    return c > 3 && r && Object.defineProperty(target, key, r), r;
};
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __metadata = (this && this.__metadata) || function (k, v) {
    if (typeof Reflect === "object" && typeof Reflect.metadata === "function") return Reflect.metadata(k, v);
};
var __param = (this && this.__param) || function (paramIndex, decorator) {
    return function (target, key) { decorator(target, key, paramIndex); }
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const files_service_1 = require("./files.service");
const fs = __importStar(require("fs"));
const util_1 = require("util");
const stat = (0, util_1.promisify)(fs.stat);
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    async getAllFiles() {
        return (await this.filesService.getAllFiles());
    }
    async getFileById(id) {
        try {
            const file = await this.filesService.getFileById(id);
            return {
                ...file,
                url: `/api/files/${file.file_type}/${file.filename}`,
                downloadUrl: `/api/files/number${file.id}/download`
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Ошибка при получении информации о файле:', error);
            throw new common_1.HttpException('Ошибка при получении информации о файле', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadFile(id, res) {
        try {
            const file = await this.filesService.getFileById(id);
            const filePath = file.path;
            res.download(filePath, file.original_name);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Ошибка при скачивании файла:', error);
            throw new common_1.HttpException('Ошибка при скачивании файла', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async deleteFile(id) {
        try {
            await this.filesService.deleteFile(id);
            return {
                message: 'File deleted successfully',
                status: 'success'
            };
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Error deleting file:', error);
            throw new common_1.HttpException('Error deleting file', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async uploadFiles(files) {
        if (!files?.files || files.files.length === 0) {
            throw new common_1.BadRequestException('Пожалуйста, загрузите файлы!');
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
        }
        catch (error) {
            console.error('Ошибка при загрузке файлов:', error);
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            else {
                throw new common_1.HttpException('Ошибка при обработке файлов на сервере', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
            }
        }
    }
    async streamVideo(id, req, res) {
        try {
            const file = await this.filesService.getFileById(id);
            if (!file) {
                throw new common_1.HttpException('Файл не найден', common_1.HttpStatus.NOT_FOUND);
            }
            if (file.file_type !== 'videos' && !file.mime_type.startsWith('video/')) {
                console.log('Debug: File failed video type check.');
                throw new common_1.HttpException('Запрашиваемый файл не является видео', common_1.HttpStatus.BAD_REQUEST);
            }
            console.log("Статистика по видео : ", file.original_name);
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
                    'Content-Type': file.mime_type,
                };
                res.writeHead(common_1.HttpStatus.PARTIAL_CONTENT, head);
                fileStream.pipe(res);
            }
            else {
                const head = {
                    'Content-Length': fileSize,
                    'Content-Type': file.mime_type,
                };
                res.writeHead(common_1.HttpStatus.OK, head);
                fs.createReadStream(videoPath).pipe(res);
            }
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            console.error('Ошибка при потоковой передаче видео:', error);
            throw new common_1.HttpException('Ошибка при потоковой передаче видео', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadHyssSetupExe(res) {
        try {
            const filePath = (0, path_1.join)(process.cwd(), '/Hyss-Setup-0.1.0.exe');
            const fileName = 'Hyss-Setup-0.1.0.exe';
            res.download(filePath, fileName, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.warn(`Файл не найден для скачивания: ${filePath}`);
                        res.status(common_1.HttpStatus.NOT_FOUND).send('Файл Hyss-Setup-0.1.0.exe не найден.');
                    }
                    else {
                        console.error('Ошибка при скачивании Hyss-Setup-0.1.0.exe:', err);
                        res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send('Не удалось скачать файл Hyss-Setup-0.1.0.exe.');
                    }
                }
            });
        }
        catch (error) {
            console.error('Непредвиденная ошибка в downloadHyssSetupExe (вне коллбэка download):', error);
            throw new common_1.HttpException('Произошла непредвиденная ошибка.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async downloadRiotTxt(res) {
        try {
            const filePath = (0, path_1.join)(process.cwd(), '/riot.txt');
            const fileName = 'riot.txt';
            res.download(filePath, fileName, (err) => {
                if (err) {
                    if (err.code === 'ENOENT') {
                        console.warn(`Файл не найден для скачивания: ${filePath}`);
                        res.status(common_1.HttpStatus.NOT_FOUND).send('Файл riot.txt не найден.');
                    }
                    else {
                        console.error('Ошибка при скачивании riot.txt:', err);
                        res.status(common_1.HttpStatus.INTERNAL_SERVER_ERROR).send('Не удалось скачать файл riot.txt.');
                    }
                }
            });
        }
        catch (error) {
            console.error('Непредвиденная ошибка в downloadRiotTxt (вне коллбэка download):', error);
            throw new common_1.HttpException('Произошла непредвиденная ошибка.', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getAllFiles", null);
__decorate([
    (0, common_1.Get)('number:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFileById", null);
__decorate([
    (0, common_1.Get)('number:id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)('number:id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "deleteFile", null);
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileFieldsInterceptor)([{ name: 'files', maxCount: 10 }], {
        storage: (0, multer_1.memoryStorage)(),
        limits: {
            fileSize: 6000 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFiles)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "uploadFiles", null);
__decorate([
    (0, common_1.Get)('stream/:id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Req)()),
    __param(2, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "streamVideo", null);
__decorate([
    (0, common_1.Get)('Hyss-Setup-0.1.0.exe'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadHyssSetupExe", null);
__decorate([
    (0, common_1.Get)('Hyss-Setup-0.1.0.exe/riot.txt'),
    __param(0, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadRiotTxt", null);
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map