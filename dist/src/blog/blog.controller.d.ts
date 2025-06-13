import { BlogService } from './blog.service';
import { CreateBlogDto, UpdateBlogDto } from './blog.dto';
import { IBlogQuery } from './blog.interface';
export declare class BlogController {
    private readonly blogService;
    constructor(blogService: BlogService);
    findAll(query: IBlogQuery): Promise<{
        articles: import("./entities/blog.entity").Blog[];
        totalCount: number;
        page: number;
        totalPages: number;
    }>;
    findOne(id: string): Promise<import("./entities/blog.entity").Blog>;
    create(createBlogDto: CreateBlogDto): Promise<import("./entities/blog.entity").Blog>;
    update(id: string, updateBlogDto: UpdateBlogDto): Promise<import("./entities/blog.entity").Blog>;
    remove(id: string): Promise<{
        success: boolean;
    }>;
}
