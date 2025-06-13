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
exports.AudioController = void 0;
const common_1 = require("@nestjs/common");
const platform_express_1 = require("@nestjs/platform-express");
const multer_1 = require("multer");
const path_1 = require("path");
const audio_service_1 = require("./audio.service");
let AudioController = class AudioController {
    audioService;
    constructor(audioService) {
        this.audioService = audioService;
    }
    async uploadAudio(audio) {
        if (!audio) {
            throw new common_1.BadRequestException('Пожалуйста, загрузите аудио!');
        }
        const fileDetails = await this.audioService.saveAudio(audio);
        return { message: 'Аудио успешно загружено!', data: fileDetails };
    }
    async getAudio() {
        return await this.audioService.getAllAudio();
    }
    async downloadAudio(id, res) {
        try {
            const audioInfo = await this.audioService.getAudioById(id);
            if (!audioInfo) {
                throw new common_1.HttpException('Аудио не найдено', common_1.HttpStatus.NOT_FOUND);
            }
            res.sendFile(audioInfo.path);
        }
        catch (error) {
            if (error instanceof common_1.HttpException) {
                throw error;
            }
            throw new common_1.HttpException('Ошибка сервера при скачивании аудио', common_1.HttpStatus.INTERNAL_SERVER_ERROR);
        }
    }
};
exports.AudioController = AudioController;
__decorate([
    (0, common_1.Post)('upload'),
    (0, common_1.UseInterceptors)((0, platform_express_1.FileInterceptor)('audio', {
        storage: (0, multer_1.diskStorage)({
            destination: './uploads',
            filename: (req, file, callback) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                const ext = (0, path_1.extname)(file.originalname);
                const filename = `${file.originalname.replace(ext, '')}-${uniqueSuffix}${ext}`;
                callback(null, filename);
            },
        }),
        limits: {
            fileSize: 100 * 1024 * 1024,
        },
    })),
    __param(0, (0, common_1.UploadedFile)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [Object]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "uploadAudio", null);
__decorate([
    (0, common_1.Get)(),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", []),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "getAudio", null);
__decorate([
    (0, common_1.Get)(':id'),
    __param(0, (0, common_1.Param)('id')),
    __param(1, (0, common_1.Res)()),
    __metadata("design:type", Function),
    __metadata("design:paramtypes", [String, Object]),
    __metadata("design:returntype", Promise)
], AudioController.prototype, "downloadAudio", null);
exports.AudioController = AudioController = __decorate([
    (0, common_1.Controller)('audio'),
    __metadata("design:paramtypes", [audio_service_1.AudioService])
], AudioController);
//# sourceMappingURL=audio.controller.js.map