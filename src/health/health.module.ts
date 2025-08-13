import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
// import { RedisCacheModule } from '../redis/cache.module';
import { HealthController } from './health.controller';

@Module({
  imports: [ConfigModule],
  controllers: [HealthController],
})
export class HealthModule {}
