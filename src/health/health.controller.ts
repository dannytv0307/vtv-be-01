import { Controller, Get, Inject } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import type { RedisClientType } from 'redis';
import { REDIS_CLIENT } from '../redis/redis.module';
import { DataSource } from 'typeorm';

@Controller('health')
export class HealthController {
  constructor(
    private readonly config: ConfigService,
    @Inject(REDIS_CLIENT) private readonly redis: RedisClientType,
    private readonly dataSource: DataSource,
  ) {}

  @Get()
  async liveness() {
    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      app: this.config.get<string>('APP_NAME') || 'app',
      version: this.config.get<string>('APP_VERSION') || '0.0.0',
    };
  }

  @Get('ready')
  async readiness() {
    // Redis check
    const redisStart = Date.now();
    const redisPing = await this.redis.ping();
    const redisMs = Date.now() - redisStart;

    // DB check
    const dbStart = Date.now();
    await this.dataSource.query('SELECT 1');
    const dbMs = Date.now() - dbStart;

    return {
      status: 'ok',
      timestamp: new Date().toISOString(),
      checks: {
        redis: { ok: redisPing === 'PONG', latencyMs: redisMs },
        db: { ok: true, latencyMs: dbMs },
      },
    };
  }
}
