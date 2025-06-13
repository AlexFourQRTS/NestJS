import { MulterFile } from '../interface/files.interface';
import { AudioService } from './audio.service';
import { Response } from 'express';
export declare class AudioController {
    private readonly audioService;
    constructor(audioService: AudioService);
    uploadAudio(audio: MulterFile): Promise<{
        message: string;
        data: any;
    }>;
    getAudio(): Promise<any[]>;
    downloadAudio(id: string, res: Response): Promise<void>;
}
