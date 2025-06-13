import { MulterFile } from '../interface/files.interface';
import { VideoService } from './video.service';
import { Response } from 'express';
export declare class VideoController {
    private readonly videoService;
    constructor(videoService: VideoService);
    uploadVideo(video: MulterFile): Promise<{
        message: string;
        data: any;
    }>;
    getVideos(): Promise<any[]>;
    downloadVideo(id: string, res: Response): Promise<void>;
}
