import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository, Like, ILike } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto, UpdateBlogDto, IBlogQuery } from './blog.dto';

@Injectable()
export class BlogService {
  constructor(
    @InjectRepository(Blog)
    private blogRepository: Repository<Blog>,
  ) {}

  async findAll(query: IBlogQuery) {
    const { search, category, page = 1, limit = 10 } = query;
    const skip = (page - 1) * limit;

    const where: any = {};

    if (search) {
      where.name = ILike(`%${search}%`);
    }

    if (category && category !== 'all') {
      where.category = category;
    }

    const [blogs, total] = await Promise.all([
      this.blogRepository.find({
        where,
        skip,
        take: limit,
        order: { created_at: 'DESC' },
      }),
      this.blogRepository.count({ where }),
    ]);

    return {
      articles: blogs,
      totalCount: total,
      page,
      totalPages: Math.ceil(total / limit),
    };
  }

  async findOne(id: string) {
    const blog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    return blog;
  }

  async create(createBlogDto: CreateBlogDto) {
    const blog = this.blogRepository.create({
      ...createBlogDto,
      image: createBlogDto.image || 'No',
      featured: createBlogDto.featured || false,
      canEdit: createBlogDto.canEdit ?? true,
      readTime: createBlogDto.readTime || 5,
    });
    return this.blogRepository.save(blog);
  }

  async update(id: string, updateBlogDto: UpdateBlogDto) {
    const blog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    Object.assign(blog, updateBlogDto);
    return this.blogRepository.save(blog);
  }

  async remove(id: string) {
    const blog = await this.blogRepository.findOne({
      where: { id },
    });

    if (!blog) {
      throw new NotFoundException('Blog not found');
    }

    await this.blogRepository.remove(blog);
    return { success: true };
  }
} 