import {
  Column,
  CreateDateColumn,
  DeleteDateColumn,
  Entity,
  Index,
  OneToOne,
  JoinColumn,
  UpdateDateColumn,
} from 'typeorm';
import { User } from '../../users/entities/user.entity';

@Entity({ name: 'refresh_tokens' })
export class RefreshToken {
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
  @Column({ name: 'user_id', type: 'bigint' })
  userId!: number;

  @Column({ type: 'varchar', length: 255 })
  token!: string;

  @Column({ name: 'expires_at', type: 'timestamptz' })
  expiresAt!: Date;

  @Column({ name: 'is_revoked', type: 'boolean', default: false })
  isRevoked!: boolean;

  @DeleteDateColumn({ name: 'deleted_at', type: 'timestamptz', nullable: true })
  deletedAt!: Date | null;

  @CreateDateColumn({ name: 'created_at', type: 'timestamptz' })
  createdAt!: Date;

  @UpdateDateColumn({ name: 'updated_at', type: 'timestamptz' })
  updatedAt!: Date;

  @OneToOne(() => User, (user) => user.refreshToken)
  @JoinColumn({ name: 'user_id' })
  user!: User;
}
