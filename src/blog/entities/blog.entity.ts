import { Entity, PrimaryGeneratedColumn, Column, CreateDateColumn, UpdateDateColumn, OneToMany } from 'typeorm';
import { Comment } from './comment.entity';

@Entity('blog_posts')
export class Blog {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  name: string;

  @Column({ nullable: true })
  content: string;

  @Column({ nullable: true })
  excerpt: string;

  @Column({ nullable: true })
  category: string;

  @Column('text', { array: true, nullable: true })
  tags: string[];

  @Column({ nullable: true, default: 'No' })
  image: string;

  @Column({ nullable: true })
  image_url: string;

  @Column({ name: 'featured', nullable: true, default: false })
  featured: boolean;

  @Column({ name: 'canedit', nullable: true, default: true })
  canEdit: boolean;

  @Column({ name: 'readtime', nullable: true, default: 5 })
  readTime: number;

  @CreateDateColumn()
  created_at: Date;

  @UpdateDateColumn()
  updated_at: Date;

  @OneToMany(() => Comment, comment => comment.blog)
  comments: Comment[];
} 