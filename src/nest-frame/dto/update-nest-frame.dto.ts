import { PartialType } from '@nestjs/mapped-types';
import { CreateNestFrameDto } from './create-nest-frame.dto';

export class UpdateNestFrameDto extends PartialType(CreateNestFrameDto) {}
