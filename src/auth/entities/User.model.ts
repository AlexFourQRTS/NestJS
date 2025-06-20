import { 
  Table, 
  Column, 
  Model, 
  DataType, 
  CreatedAt, 
  UpdatedAt,
  BeforeCreate,
  BeforeUpdate
} from 'sequelize-typescript';
import * as bcrypt from 'bcrypt';

export enum UserRole {
  USER = 'user',
  ADMIN = 'admin'
}

@Table({
  tableName: 'users',
  timestamps: true,
})
export class User extends Model<User> {
  @Column({
    type: DataType.UUID,
    defaultValue: DataType.UUIDV4,
    primaryKey: true,
  })
  declare id: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
    unique: true,
    validate: {
      isEmail: true,
    },
  })
  declare email: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare name: string;

  @Column({
    type: DataType.STRING,
    allowNull: false,
  })
  declare password: string;

  @Column({
    type: DataType.ENUM(...Object.values(UserRole)),
    defaultValue: UserRole.USER,
  })
  declare role: UserRole;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: true,
  })
  declare isActive: boolean;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isTwoFactorEnabled: boolean;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare twoFactorSecret: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare emailVerificationToken: string;

  @Column({
    type: DataType.BOOLEAN,
    defaultValue: false,
  })
  declare isEmailVerified: boolean;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare lastLoginAt: Date;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare lastLoginIp: string;

  @Column({
    type: DataType.STRING,
    allowNull: true,
  })
  declare passwordResetToken: string;

  @Column({
    type: DataType.DATE,
    allowNull: true,
  })
  declare passwordResetExpires: Date;

  @CreatedAt
  declare createdAt: Date;

  @UpdatedAt
  declare updatedAt: Date;

  @BeforeCreate
  @BeforeUpdate
  static async hashPassword(instance: User) {
    if (instance.changed('password')) {
      const saltRounds = 10;
      instance.password = await bcrypt.hash(instance.password, saltRounds);
    }
  }

  async comparePassword(password: string): Promise<boolean> {
    return bcrypt.compare(password, this.password);
  }

  toJSON(): any {
    const values = Object.assign({}, this.get());
    delete values.password;
    delete values.twoFactorSecret;
    delete values.emailVerificationToken;
    delete values.passwordResetToken;
    delete values.passwordResetExpires;
    return values;
  }
}

export default User; 