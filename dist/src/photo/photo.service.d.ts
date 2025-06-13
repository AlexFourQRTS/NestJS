import { OnModuleDestroy } from '@nestjs/common';
import { MulterFile } from '../interface/files.interface';
import { ConfigService } from '@nestjs/config';
export declare class PhotoService implements OnModuleDestroy {
    private readonly configService;
    private client;
    private readonly baseUploadDir;
    private readonly tempUploadDir;
    private readonly allowedExtensions;
    constructor(configService: ConfigService);
    private connectAndInitializeDatabase;
    savePhoto(photo: MulterFile): Promise<any>;
    getAllPhotos(): Promise<any[]>;
    getPhotoById(id: string): Promise<any | null>;
    onModuleDestroy(): Promise<void>;
}
