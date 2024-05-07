import { Injectable } from "@nestjs/common";
import { RedisConfigService } from "./redis-config.service";

@Injectable()
export class RedisRelayConfigService extends RedisConfigService {
    constructor() {
        super();
        this.connectionString = process.env.REDIS_RELAY_CONNECTION_STRING;
        this.host = process.env.REDIS_RELAY_HOST ?? "127.0.0.1";
        this.password = process.env.REDIS_RELAY_PASSWORD;
        this.port = +process.env.REDIS_RELAY_PORT ?? 6379;
        this.database = process.env.REDIS_RELAY_DATABASE ? +process.env.REDIS_DATABASE : 0;
        this.useTLS = process.env.REDIS_RELAY_USE_TLS === "true";
        this.lpushBlockSize = process.env.REDIS_RELAY_LPUSH_BLOCK_SIZE ? +process.env.REDIS_LPUSH_BLOCK_SIZE : 250;
    }
}
