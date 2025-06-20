import { Controller, Get, Post, Body, Patch, Param, Delete } from '@nestjs/common';
import { ThinkService } from './think.service';
import { CreateThinkDto } from './dto/create-think.dto';
import { UpdateThinkDto } from './dto/update-think.dto';

@Controller('think')
export class ThinkController {
  constructor(private readonly thinkService: ThinkService) {}

  @Post()
  create(@Body() createThinkDto: CreateThinkDto) {
    return this.thinkService.create(createThinkDto);
  }

  @Get()
  findAll() {
    return this.thinkService.findAll();
  }

  @Get(':id')
  findOne(@Param('id') id: string) {
    return this.thinkService.findOne(+id);
  }

  @Patch(':id')
  update(@Param('id') id: string, @Body() updateThinkDto: UpdateThinkDto) {
    return this.thinkService.update(+id, updateThinkDto);
  }

  @Delete(':id')
  remove(@Param('id') id: string) {
    return this.thinkService.remove(+id);
  }
}
