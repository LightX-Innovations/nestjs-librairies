import { HealthCheckError, HealthIndicator, HealthIndicatorResult } from "@nestjs/terminus";
import { Injectable } from "@nestjs/common";
import { RedisService } from "../services/redis.service";

@Injectable()
export class RedisHealthIndicator extends HealthIndicator {
    constructor(private redisService: RedisService) {
        super();
    }

    public async pingCheck(key: string): Promise<HealthIndicatorResult> {
        let result;
        let isHealthy = false;

        try {
            const [error, response] = await this.redisService.ping();
            isHealthy = error === null || error === undefined;
            result = this.getStatus(key, isHealthy, { operation: "PING", response, error });

            if (isHealthy) {
                return result;
            }
        } catch (error) {
            result = this.getStatus(key, false, { operation: "PING", "response": "", error });
        }

        throw new HealthCheckError("Redis check failed", result);
    }
}
