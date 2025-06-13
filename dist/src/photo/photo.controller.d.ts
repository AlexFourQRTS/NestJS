import { MulterFile } from '../interface/files.interface';
import { PhotoService } from './photo.service';
import { Response } from 'express';
export declare class PhotoController {
    private readonly photoService;
    constructor(photoService: PhotoService);
    uploadPhoto(photo: MulterFile): Promise<{
        message: string;
        data: any;
    }>;
    getPhotos(): Promise<any[]>;
    downloadPhoto(id: string, res: Response): Promise<void>;
}
