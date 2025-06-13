import { OnModuleDestroy } from '@nestjs/common';
import { MulterFile } from '../interface/files.interface';
import { ConfigService } from '@nestjs/config';
export declare class VideoService implements OnModuleDestroy {
    private readonly configService;
    private client;
    private readonly baseUploadDir;
    private readonly tempUploadDir;
    private readonly allowedExtensions;
    constructor(configService: ConfigService);
    private connectAndInitializeDatabase;
    saveVideo(video: MulterFile): Promise<any>;
    getAllVideos(): Promise<any[]>;
    getVideoById(id: string): Promise<any | null>;
    onModuleDestroy(): Promise<void>;
}
