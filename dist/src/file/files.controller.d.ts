import { Response, Request } from 'express';
import { MulterFile } from '../interface/files.interface';
import { FilesService } from './files.service';
export declare class FilesController {
    private readonly filesService;
    constructor(filesService: FilesService);
    getAllFiles(): Promise<{
        images: {
            url: string;
            downloadUrl: string;
            id: string;
            filename: string;
            original_name: string;
            file_type: string;
            path: string;
            size: number;
            mime_type: string;
            uploaded_at: Date;
        }[];
        videos: {
            url: string;
            downloadUrl: string;
            id: string;
            filename: string;
            original_name: string;
            file_type: string;
            path: string;
            size: number;
            mime_type: string;
            uploaded_at: Date;
        }[];
        audio: {
            url: string;
            downloadUrl: string;
            id: string;
            filename: string;
            original_name: string;
            file_type: string;
            path: string;
            size: number;
            mime_type: string;
            uploaded_at: Date;
        }[];
        documents: {
            url: string;
            downloadUrl: string;
            id: string;
            filename: string;
            original_name: string;
            file_type: string;
            path: string;
            size: number;
            mime_type: string;
            uploaded_at: Date;
        }[];
        other: {
            url: string;
            downloadUrl: string;
            id: string;
            filename: string;
            original_name: string;
            file_type: string;
            path: string;
            size: number;
            mime_type: string;
            uploaded_at: Date;
        }[];
    }>;
    getFileById(id: string): Promise<{
        url: string;
        downloadUrl: string;
        id: string;
        filename: string;
        original_name: string;
        file_type: string;
        path: string;
        size: number;
        mime_type: string;
        uploaded_at: Date;
    }>;
    downloadFile(id: string, res: Response): Promise<void>;
    deleteFile(id: string): Promise<{
        message: string;
        status: string;
    }>;
    uploadFiles(files: {
        files?: MulterFile[];
    }): Promise<{
        message: string;
        data: {
            url: string;
            downloadUrl: string;
            id: string;
            filename: string;
            original_name: string;
            file_type: string;
            path: string;
            size: number;
            mime_type: string;
            uploaded_at: Date;
        }[];
    }>;
    streamVideo(id: string, req: Request, res: Response): Promise<void>;
    downloadHyssSetupExe(res: Response): Promise<void>;
    downloadRiotTxt(res: Response): Promise<void>;
}
