import { Injectable, Logger, OnModuleDestroy } from '@nestjs/common';
import Redis from 'ioredis';

@Injectable()
export class RedisService implements OnModuleDestroy {
  private readonly logger = new Logger(RedisService.name);
  private readonly redis: Redis;

  constructor() {
    const url = process.env.REDIS_URL ?? 'redis://localhost:6379';
    this.redis = new Redis(url, { maxRetriesPerRequest: 2 });

    this.redis.on('connect', () => this.logger.log('Redis connected'));
    this.redis.on('error', (error) => this.logger.error(error.message));
  }

  getClient() {
    return this.redis;
  }

  async onModuleDestroy() {
    await this.redis.quit();
  }
}
