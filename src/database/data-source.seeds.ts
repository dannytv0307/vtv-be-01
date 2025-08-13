import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

const configService = new ConfigService();

export const SeedsDataSource = new DataSource({
  type: 'postgres',
  host: configService.get('DATABASE_HOST'),
  port: configService.get('DATABASE_PORT'),
  username: configService.get('DATABASE_USER'),
  password: configService.get('DATABASE_PASSWORD'),
  database: configService.get('DATABASE_NAME'),
  entities: [User, Role, RefreshToken],
  synchronize: false,
  logging: true,
  ssl: false,
});
