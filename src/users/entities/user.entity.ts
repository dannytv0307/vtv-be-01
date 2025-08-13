import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  ManyToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { RefreshToken } from '../../auth/entities/refresh-token.entity';
import { Role, RoleType } from './role.entity';

export enum AuthProvider {
  Local = 'local',
  Google = 'google',
  Facebook = 'facebook',
}

@Entity({ name: 'users' })
export class User {
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
  @Column({ type: 'varchar', length: 255, nullable: true })
  email!: string | null;

  @Column({ name: 'password_hash', type: 'varchar', length: 255, nullable: true })
  passwordHash!: string | null;

  @Column({ name: 'display_name', type: 'varchar', length: 255, nullable: true })
  displayName!: string | null;

  @Column({
    type: 'enum',
    enum: AuthProvider,
    enumName: 'auth_provider_enum',
    default: AuthProvider.Local,
  })
  provider!: AuthProvider;

  @Column({ name: 'provider_id', type: 'varchar', length: 255, nullable: true })
  providerId!: string | null;

  @Column({ name: 'avatar_url', type: 'text', nullable: true })
  avatarUrl!: string | null;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => RefreshToken, (rt) => rt.user)
  refreshToken!: RefreshToken | null;

  @Column({ name: 'role_id', type: 'bigint', nullable: true })
  roleId!: number | null;

  @ManyToOne(() => Role, (role) => role.users, { eager: true, nullable: true })
  @JoinColumn({ name: 'role_id' })
  role!: Role | null;
}
