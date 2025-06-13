export declare class CreateBlogDto {
    name: string;
    content: string;
    image?: string;
    image_url?: string;
    category?: string;
    excerpt: string;
    tags?: string[];
    featured?: boolean;
    canEdit?: boolean;
    readTime?: number;
}
export declare class UpdateBlogDto extends CreateBlogDto {
}
export declare class IBlogQuery {
    search?: string;
    category?: string;
    page?: number;
    limit?: number;
}
export declare class CommentDto {
    content: string;
}
