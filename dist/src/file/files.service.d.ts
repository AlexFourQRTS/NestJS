import { OnModuleDestroy } from '@nestjs/common';
import { MulterFile } from '../interface/files.interface';
import { ConfigService } from '@nestjs/config';
import { Repository } from 'typeorm';
import { File } from './entities/file.entity';
export declare class FilesService implements OnModuleDestroy {
    private readonly configService;
    private filesRepository;
    private client;
    private readonly imageExtensions;
    private readonly videoExtensions;
    private readonly audioExtensions;
    private readonly documentExtensions;
    private readonly baseUploadDir;
    private readonly typeDirs;
    constructor(configService: ConfigService, filesRepository: Repository<File>);
    private connectAndInitializeDatabase;
    private initializeDirectories;
    private determineFileType;
    private getUploadPath;
    getAllFiles(): Promise<{
        [key: string]: File[];
    }>;
    getFileById(id: string): Promise<File>;
    saveFiles(files: MulterFile[]): Promise<File[]>;
    deleteFile(id: string): Promise<void>;
    onModuleDestroy(): Promise<void>;
}
