import 'dotenv/config';
import { DataSource } from 'typeorm';
import { ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

const configService = new ConfigService();
const host = configService.get<string>('DATABASE_HOST');
const port = Number(configService.get<string>('DATABASE_PORT')) || 5432;
const username = configService.get<string>('DATABASE_USER');
const password = configService.get<string>('DATABASE_PASSWORD');
const database = configService.get<string>('DATABASE_NAME');
const logging = String(configService.get('DATABASE_LOGGING')).toLowerCase() === 'true';

export const AppDataSource = new DataSource({
  type: 'postgres',
  host,
  port,
  username,
  password,
  database,
  entities: [User, Role, RefreshToken],
  migrations: ['src/database/migrations/*.ts'],
  synchronize: false,
  logging,
  ssl: false,
});
