import { Injectable } from '@nestjs/common';
import { CreateThinkDto } from './dto/create-think.dto';
import { UpdateThinkDto } from './dto/update-think.dto';

@Injectable()
export class ThinkService {
  create(createThinkDto: CreateThinkDto) {
    return 'This action adds a new think';
  }

  findAll() {
    return `This action returns all think`;
  }

  findOne(id: number) {
    return `This action returns a #${id} think`;
  }

  update(id: number, updateThinkDto: UpdateThinkDto) {
    return `This action updates a #${id} think`;
  }

  remove(id: number) {
    return `This action removes a #${id} think`;
  }
}
