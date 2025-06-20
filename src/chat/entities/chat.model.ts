import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  CreatedAt, 
  UpdatedAt
} from 'sequelize-typescript';

@Table({
  tableName: 'chats',
  timestamps: true,
})
export class Chat extends Model<Chat> {
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

export default Chat;
