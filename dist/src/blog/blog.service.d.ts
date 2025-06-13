import { Repository } from 'typeorm';
import { Blog } from './entities/blog.entity';
import { CreateBlogDto, UpdateBlogDto, IBlogQuery } from './blog.dto';
export declare class BlogService {
    private blogRepository;
    constructor(blogRepository: Repository<Blog>);
    findAll(query: IBlogQuery): Promise<{
        articles: Blog[];
        totalCount: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<Blog>;
    create(createBlogDto: CreateBlogDto): Promise<Blog>;
    update(id: string, updateBlogDto: UpdateBlogDto): Promise<Blog>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
