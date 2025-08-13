import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToMany,
  UpdateDateColumn,
} from 'typeorm';
import { User } from './user.entity';

export enum RoleType {
  Admin = 'admin',
  User = 'user',
  Moderator = 'moderator',
}

@Entity({ name: 'roles' })
export class Role {
  @Column('bigint', {
    primary: true,
    generated: 'increment',
    transformer: {
      to: (value?: number) => value,
      from: (value: string | null) => (value == null ? (value as any) : Number(value)),
    },
  })
  id!: number;

  @Index({ unique: true })
  @Column({
    type: 'enum',
    enum: RoleType,
    enumName: 'role_type_enum',
  })
  type!: RoleType;

  @Column({ type: 'varchar', length: 255, nullable: true })
  name!: string | null;

  @Column({ type: 'text', nullable: true })
  description!: string | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToMany(() => User, (user) => user.role)
  users!: User[];
}
