import { OnModuleDestroy } from '@nestjs/common';
import { MulterFile } from '../interface/files.interface';
import { ConfigService } from '@nestjs/config';
export declare class AudioService implements OnModuleDestroy {
    private readonly configService;
    private client;
    private readonly baseUploadDir;
    private readonly tempUploadDir;
    private readonly allowedExtensions;
    constructor(configService: ConfigService);
    private connectAndInitializeDatabase;
    saveAudio(audio: MulterFile): Promise<any>;
    getAllAudio(): Promise<any[]>;
    getAudioById(id: string): Promise<any | null>;
    onModuleDestroy(): Promise<void>;
}
