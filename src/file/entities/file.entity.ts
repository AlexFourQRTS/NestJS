import { Entity, Column, PrimaryGeneratedColumn, CreateDateColumn } from 'typeorm';

@Entity('files')
export class File {
  @PrimaryGeneratedColumn('uuid')
  id: string;

  @Column({ nullable: true })
  filename: string;

  @Column({ nullable: true })
  original_name: string;

  @Column({ nullable: true })
  file_type: string;

  @Column({ nullable: true })
  path: string;

  @Column('bigint', { nullable: true })
  size: number;

  @Column({ nullable: true })
  mime_type: string;

  @CreateDateColumn()
  uploaded_at: Date;
} 