export interface IBlog {
    id: string;
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    imageUrl: string;
    authorId: string;
    likes: string[];
    dislikes: string[];
    comments: IComment[];
    views: number;
    isPublished: boolean;
    createdAt: Date;
    updatedAt: Date;
}
export interface IComment {
    id: string;
    content: string;
    userId: string;
    createdAt: Date;
    updatedAt: Date;
}
export interface IBlogCreate {
    title: string;
    content: string;
    excerpt: string;
    category: string;
    tags: string[];
    imageUrl?: string;
}
export interface IBlogUpdate extends Partial<IBlogCreate> {
}
export interface IBlogQuery {
    search?: string;
    category?: string;
    tag?: string;
    page?: number;
    limit?: number;
}
