import { Controller, Get, Post, Body, Patch, Param, Delete, Query, HttpException, HttpStatus } from '@nestjs/common';
import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { IBlogQuery } from './blog.interface';

@Controller('blog')
export class BlogController {
  constructor(private readonly blogService: BlogService) {}

  @Get()
  async findAll(@Query() query: IBlogQuery) {
    try {
      const result = await this.blogService.findAll(query);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to fetch blogs',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Get(':id')
  async findOne(@Param('id') id: string) {
    try {
      const blog = await this.blogService.findOne(id);
      return blog;
    } catch (error) {
      throw new HttpException(
        error.message || 'Blog not found',
        error.status || HttpStatus.NOT_FOUND
      );
    }
  }

  @Post()
  async create(@Body() createBlogDto: CreateBlogDto) {
    try {
      const blog = await this.blogService.create(createBlogDto);
      return blog;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to create blog',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Patch(':id')
  async update(
    @Param('id') id: string,
    @Body() updateBlogDto: UpdateBlogDto,
  ) {
    try {
      const blog = await this.blogService.update(id, updateBlogDto);
      return blog;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to update blog',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }

  @Delete(':id')
  async remove(@Param('id') id: string) {
    try {
      const result = await this.blogService.remove(id);
      return result;
    } catch (error) {
      throw new HttpException(
        error.message || 'Failed to delete blog',
        error.status || HttpStatus.INTERNAL_SERVER_ERROR
      );
    }
  }
} 