import { Module, Global, Provider } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { createClient, type RedisClientType } from 'redis';

export const REDIS_CLIENT = 'REDIS_CLIENT';

const redisClientProvider: Provider = {
  provide: REDIS_CLIENT,
  inject: [ConfigService],
  useFactory: async (config: ConfigService): Promise<RedisClientType> => {
    const host = config.get<string>('REDIS_HOST') || 'localhost';
    const port = Number(config.get<string>('REDIS_PORT')) || 6379;
    const password = config.get<string>('REDIS_PASSWORD');
    const database = Number(config.get<string>('REDIS_DB')) || 0;

    const client: RedisClientType = createClient({
      socket: { host, port },
      password,
      database,
    });
    await client.connect();
    return client;
  },
};

@Global()
@Module({
  imports: [ConfigModule],
  providers: [redisClientProvider],
  exports: [REDIS_CLIENT],
})
export class RedisModule {}


