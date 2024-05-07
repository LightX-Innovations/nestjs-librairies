import { Injectable } from "@nestjs/common";
import Redis from "ioredis";
import { RedisRelayConfigService } from "./redis-relay-config.service";

@Injectable()
export class RedisRelayService {
    public readonly client: Redis;

    constructor(private readonly configService: RedisRelayConfigService) {
        this.client = configService.getRedisInstance();
    }
}
