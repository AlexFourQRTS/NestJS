import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { Op } from 'sequelize';
import { Blog } from './entities/blog.model';
import { CreateBlogDto, UpdateBlogDto, IBlogQuery } from './blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectModel(Blog)
    private blogModel: typeof Blog,
  ) {}

  async findAll(query: IBlogQuery) {
    const { search, category, page = 1, limit = 10 } = query;
    const offset = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = { [Op.iLike]: `%${search}%` };
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const { rows: blogs, count: total } = await this.blogModel.findAndCountAll({
      where,
      offset,
      limit,
      order: [['created_at', 'DESC']],
    });

    return {
      articles: blogs,
      totalCount: total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const blog = await this.blogModel.findByPk(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async create(createBlogDto: CreateBlogDto) {
    const blog = await this.blogModel.create({
      ...createBlogDto,
      image: createBlogDto.image || 'No',
      featured: createBlogDto.featured || false,
      canEdit: createBlogDto.canEdit ?? true,
      readTime: createBlogDto.readTime || 5,
    });
    return blog;
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.blogModel.findByPk(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await blog.update(updateBlogDto);
    return blog;
  }

  async remove(id: string) {
    const blog = await this.blogModel.findByPk(id);

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await blog.destroy();
    return { success: true };
  }
} 