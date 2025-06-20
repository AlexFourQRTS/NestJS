import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  CreatedAt, 
  UpdatedAt,
  HasMany
} from 'sequelize-typescript';
import { Comment } from './comment.model';

@Table({
  tableName: 'blog_posts',
  timestamps: true,
  freezeTableName: true,
  createdAt: 'created_at',
  updatedAt: 'updated_at'
})
export class Blog extends Model<Blog> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare name: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare content: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare excerpt: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare category: string;

  @Column({
    type: DataType.ARRAY(DataType.TEXT),
    allowNull: true,
  })
  declare tags: string[];

  @Column({
    type: DataType.TEXT,
    allowNull: true,
    defaultValue: 'No',
  })
  declare image: string;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare image_url: string;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: false,
  })
  declare featured: boolean;

  @Column({
    type: DataType.BOOLEAN,
    allowNull: true,
    defaultValue: true,
    field: 'canedit'
  })
  declare canEdit: boolean;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
    defaultValue: 5,
    field: 'readtime'
  })
  declare readTime: number;

  @CreatedAt
  declare created_at: Date;

  @UpdatedAt
  declare updated_at: Date;

  @HasMany(() => Comment)
  declare comments: Comment[];
}

export default Blog; 