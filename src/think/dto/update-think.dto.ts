import { PartialType } from '@nestjs/mapped-types';
import { CreateThinkDto } from './create-think.dto';

export class UpdateThinkDto extends PartialType(CreateThinkDto) {}
