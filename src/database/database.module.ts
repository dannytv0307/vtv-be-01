import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from '../users/entities/user.entity';
import { Role } from '../users/entities/role.entity';
import { RefreshToken } from '../auth/entities/refresh-token.entity';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => {
        const host = configService.get<string>('DATABASE_HOST');
        const port = Number(configService.get<string>('DATABASE_PORT')) || 5432;
        const username = configService.get<string>('DATABASE_USER');
        const password = configService.get<string>('DATABASE_PASSWORD');
        const database = configService.get<string>('DATABASE_NAME');
        // Always disable synchronize in runtime to avoid destructive schema changes
        const synchronize = false;
        const logging = String(configService.get('DATABASE_LOGGING')).toLowerCase() === 'true';

        return {
          type: 'postgres' as const,
          host,
          port,
          username,
          password,
          database,
          entities: [User, Role, RefreshToken],
          synchronize,
          logging,
          ssl: false,
        };
      },
    }),
  ],
})
export class DatabaseModule {}
