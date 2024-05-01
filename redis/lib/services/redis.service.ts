import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { ScanStreamOptions } from "ioredis/built/types";
import { RedisArrayUtils } from "../utils/array.utils";
import { RedisConfigService } from "./redis-config.service";

export interface RedidSetOptions {
    // ex: seconds, px: milliseconds
    unit: "EX" | "PX";
    duration: number;
}

export type RedisScanOptions = Omit<ScanStreamOptions, "match">;
export type RedisValue = string | Buffer | number;

@Injectable()
export class RedisService {
    private readonly client: Redis;

    constructor(private readonly configService: RedisConfigService) {
        this.client = configService.getRedisInstance();
    }

    public async disconnect(): Promise<void> {
        this.client.disconnect();
    }

    public keys(keys: string): Promise<string[]> {
        return this.client.keys(keys);
    }

    public async exist(key: string): Promise<boolean> {
        return (await this.client.exists(key)) > 0;
    }

    public set(key: string, value: RedisValue, options?: RedidSetOptions): Promise<any> {
        if (options) {
            return this.client.set(key, value, options.unit as any, options.duration);
        }

        return this.client.set(key, value);
    }

    public get(key: string): Promise<string> {
        return this.client.get(key);
    }

    public mget(...keys: string[]): Promise<(string | null)[]> {
        return this.client.mget(...keys);
    }

    public getBuffer(key: string): Promise<Buffer> {
        return this.client.getBuffer(key);
    }

    public async del(...keys: string[]): Promise<void> {
        await this.client.del(...keys);
    }

    public async lpush(key: string, ...value: RedisValue[]): Promise<number> {
        if (!value.length) {
            return;
        }

        const slices = RedisArrayUtils.getSlices(value, this.configService.lpushBlockSize);
        let lastTotalLengthForKey = 0;
        for (const slice of slices) {
            if (!slice.length) {
                continue;
            }

            lastTotalLengthForKey = await this.client.lpush(key, ...slice);
        }

        return lastTotalLengthForKey;
    }

    public lrem(key: string, value: RedisValue, count: number = 0): Promise<number> {
        return this.client.lrem(key, count, value);
    }

    public lrange(key: string, start: number, end: number): Promise<string[]> {
        return this.client.lrange(key, start, end);
    }

    public lrangeBuffer(key: string, start: number, end: number): Promise<Buffer[]> {
        return this.client.lrangeBuffer(key, start, end);
    }

    public async scanDel(pattern: string, options?: RedisScanOptions): Promise<void> {
        const keys = await this.scan(pattern, options);
        if (keys?.length) {
            await this.client.del(...keys);
        }
    }

    public sadd(key: string, ...value: RedisValue[]): Promise<number> {
        return this.client.sadd(key, value);
    }

    public srem(key: string, ...value: RedisValue[]): Promise<number> {
        return this.client.srem(key, value);
    }

    public smembers(key: string): Promise<string[]> {
        return this.client.smembers(key);
    }

    public smembersBuffer(key: string): Promise<Buffer[]> {
        return this.client.smembersBuffer(key);
    }

    public sismember(key: string, value: RedisValue): Promise<number> {
        return this.client.sismember(key, value);
    }

    public smove(source: string, destination: string, value: RedisValue): Promise<number> {
        return this.client.smove(source, destination, value);
    }

    public zadd(key: string, value: RedisValue, score: number): Promise<string | number> {
        return this.client.zadd(key, score.toString(), value);
    }

    public zrevrange(key: string, start: number, end: number): Promise<string[]> {
        return this.client.zrevrange(key, start, end);
    }

    public async zscore(key: string, value: RedisValue): Promise<number> {
        return +(await this.client.zscore(key, value));
    }

    public ping(): Promise<[Error | null, string]> {
        return new Promise((resolve, reject) => {
            this.client.ping((error, response) => {
                resolve([error, response]);
            })
        })
    }

    public scan(pattern: string, options: RedisScanOptions = { count: 1000 }): Promise<string[]> {
        return new Promise<string[]>((resolve, reject) => {
            const stream = this.client.scanStream({
                match: pattern,
                count: options.count ?? 1000,
                type: options.type
            });

            const keys = [];
            stream.on("data", resultKeys => {
                for (const key of resultKeys) {
                    keys.push(key);
                }
            });
            stream.on("end", async () => {
                resolve(keys);
            });
        });
    }
}
