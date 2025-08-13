import { Module, forwardRef } from '@nestjs/common';
import { JwtModule } from '@nestjs/jwt';
import { PassportModule } from '@nestjs/passport';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { RefreshToken } from './entities/refresh-token.entity';
import { MailModule } from '../mail/mail.module';
import { RedisModule } from '../redis/redis.module';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { JwtAccessGuard } from './guards/jwt-access.guard';
// Strategies will be added later when user/entity is restored

@Module({
  imports: [
    ConfigModule,
    forwardRef(() => UsersModule),
    TypeOrmModule.forFeature([RefreshToken]),
    PassportModule,
    RedisModule,
    MailModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET'),
        signOptions: { expiresIn: config.get<string>('JWT_EXPIRES_IN') },
      }),
    }),
  ],
  controllers: [AuthController],
  providers: [AuthService, JwtAccessGuard],
  exports: [JwtAccessGuard, JwtModule],
})
export class AuthModule {}
