import { Module, OnModuleDestroy } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { RedisHealthIndicator } from "./health-indicators/redis-health.indicator";
import { RedisConfigService } from "./services/redis-config.service";
import { RedisRelayConfigService } from "./services/redis-relay-config.service";
import { RedisRelayService } from "./services/redis-relay.service";
import { RedisService } from "./services/redis.service";

@Module({
    providers: [RedisConfigService, RedisRelayConfigService, RedisRelayService, RedisService, RedisHealthIndicator],
    exports: [RedisConfigService, RedisRelayConfigService, RedisRelayService, RedisService, RedisHealthIndicator],
})
export class RedisModule implements OnModuleDestroy {
    constructor(private readonly moduleRef: ModuleRef) {}

    public async onModuleDestroy(): Promise<void> {
        const service = await this.moduleRef.get(RedisService);

        /**
         * Disconnection causes some issues when running tests, for now we deactivate it
         */
        if (!process.env.CI) {
            await service.disconnect();
        }
    }
}

export * from "./health-indicators/redis-health.indicator";
export * from "./services/redis-config.service";
export * from "./services/redis-relay-config.service";
export * from "./services/redis-relay.service";
export * from "./services/redis.service";
