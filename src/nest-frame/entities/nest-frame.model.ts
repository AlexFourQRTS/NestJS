import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  CreatedAt, 
  UpdatedAt
} from 'sequelize-typescript';

@Table({
  tableName: 'nest_frames',
  timestamps: true,
})
export class NestFrame extends Model<NestFrame> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;
}

export default NestFrame;
