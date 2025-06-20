import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  CreatedAt
} from 'sequelize-typescript';

@Table({
  tableName: 'files',
  timestamps: false,
})
export class File extends Model<File> {
  @Column({
    type: DataType.INTEGER,
    primaryKey: true,
    autoIncrement: true,
  })
  declare id: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare filename: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare original_name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare mime_type: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare path: string;

  @Column({
    type: DataType.BIGINT,
    allowNull: false,
  })
  declare size: number;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    field: 'file_type'
  })
  declare file_type: string;

  @Column({
    type: DataType.DATE,
    allowNull: false,
    field: 'uploaded_at',
    defaultValue: DataType.NOW
  })
  declare uploaded_at: Date;
}

export default File; 