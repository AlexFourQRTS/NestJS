import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { NestFrameService } from './nest-frame.service';
import { CreateNestFrameDto } from './dto/create-nest-frame.dto';
import { UpdateNestFrameDto } from './dto/update-nest-frame.dto';

@Controller('nest-frame')
export class NestFrameController {
  constructor(private readonly nestFrameService: NestFrameService) {}

  @Post()
  create(@Body() createNestFrameDto: CreateNestFrameDto) {
    return this.nestFrameService.create(createNestFrameDto);
  }

  @Get()
  findAll() {
    return this.nestFrameService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.nestFrameService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateNestFrameDto: UpdateNestFrameDto) {
    return this.nestFrameService.update(+id, updateNestFrameDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.nestFrameService.remove(+id);
  }
}
