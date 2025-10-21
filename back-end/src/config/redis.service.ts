import { Injectable, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { createClient, RedisClientType } from 'redis';

@Injectable()
export class RedisService implements OnModuleInit, OnModuleDestroy {
    private client: RedisClientType;

    constructor(private readonly configService: ConfigService) { }

    async onModuleInit() {
        const redisConfig = this.configService.get('redis');
        const url = `redis://${redisConfig.user}:${redisConfig.password}@${redisConfig.host}`;

        this.client = createClient({ url });
        this.client.on('error', (err) => console.error('Redis Error:', err));

        await this.client.connect();
        console.log('Redis connected successfully!');
    }

    async onModuleDestroy() {
        await this.client.quit();
        console.log('Redis connection closed.');
    }

    getClient(): RedisClientType {
        return this.client;
    }
    async setEx(key: string, ttl: number, value: string) {
        return this.client.setEx(key, ttl, value);
    }

    async get(key: string) {
        return this.client.get(key);
    }

    async del(...keys: string[]) {
        return this.client.del(keys);
    }
}
