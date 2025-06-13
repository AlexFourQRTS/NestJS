import { Comment } from './comment.entity';
export declare class Blog {
    id: string;
    name: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    image: string;
    image_url: string;
    featured: boolean;
    canEdit: boolean;
    readTime: number;
    created_at: Date;
    updated_at: Date;
    comments: Comment[];
}
