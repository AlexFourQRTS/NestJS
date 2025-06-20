import { Injectable } from '@nestjs/common';
import { CreateNestFrameDto } from './dto/create-nest-frame.dto';
import { UpdateNestFrameDto } from './dto/update-nest-frame.dto';

@Injectable()
export class NestFrameService {
  create(createNestFrameDto: CreateNestFrameDto) {
    return 'This action adds a new nestFrame';
  }

  findAll() {
    return `This action returns all nestFrame`;
  }

  findOne(id: number) {
    return `This action returns a #${id} nestFrame`;
  }

  update(id: number, updateNestFrameDto: UpdateNestFrameDto) {
    return `This action updates a #${id} nestFrame`;
  }

  remove(id: number) {
    return `This action removes a #${id} nestFrame`;
  }
}
