import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  CreatedAt, 
  UpdatedAt,
  ForeignKey,
  BelongsTo
} from 'sequelize-typescript';
import { Blog } from './blog.model';

@Table({
  tableName: 'comments',
  timestamps: true,
  freezeTableName: true,
  createdAt: 'createdAt',
  updatedAt: 'updatedAt'
})
export class Comment extends Model<Comment> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.TEXT,
    allowNull: true,
  })
  declare content: string;

  @Column({
    type: DataType.INTEGER,
    allowNull: true,
  })
  declare userId: number;

  @ForeignKey(() => Blog)
  @Column({
    type: DataType.UUID,
    allowNull: true,
  })
  declare blogId: string;

  @BelongsTo(() => Blog)
  declare blog: Blog;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default Comment; 