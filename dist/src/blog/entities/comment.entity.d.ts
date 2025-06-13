import { Blog } from './blog.entity';
export declare class Comment {
    id: number;
    content: string;
    userId: number;
    blogId: number;
    blog: Blog;
    createdAt: Date;
    updatedAt: Date;
}
