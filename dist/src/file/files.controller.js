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
exports.FilesController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const files_service_1 = require("./files.service");
let FilesController = class FilesController {
    filesService;
    constructor(filesService) {
        this.filesService = filesService;
    }
    async getAllFiles() {
        try {
            const groupedFiles = await this.filesService.getAllFiles();
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
        }
        catch (error) {
            console.error('Ошибка при получении списка файлов:', error);
            throw new common_1.HttpException('Ошибка при получении списка файлов', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
    async getFileById(id) {
        try {
            const file = await this.filesService.getFileById(id);
            if (!file) {
                throw new common_1.HttpException('Файл не найден', common_1.HttpStatus.NOT_FOUND);
            }
            return {
                ...file,
                url: `/api/files/${file.file_type}/${file.filename}`,
                downloadUrl: `/api/files/${file.id}/download`
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
            if (!file) {
                throw new common_1.HttpException('Файл не найден', common_1.HttpStatus.NOT_FOUND);
            }
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
                    downloadUrl: `/api/files/${file.id}/download`
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
};
exports.FilesController = FilesController;
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getAllFiles", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "getFileById", null);
__decorate([
    (0, common_1.Get)(':id/download'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], FilesController.prototype, "downloadFile", null);
__decorate([
    (0, common_1.Delete)(':id'),
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
exports.FilesController = FilesController = __decorate([
    (0, common_1.Controller)('files'),
    __metadata("design:paramtypes", [files_service_1.FilesService])
], FilesController);
//# sourceMappingURL=files.controller.js.map