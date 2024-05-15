import { Injectable } from "@nestjs/common";
import { IConfigProvider } from "./config.provider";
import { ConfigProvider } from "../decorators";

@Injectable()
@ConfigProvider(EnvironmentConfigProvider.type)
export class EnvironmentConfigProvider implements IConfigProvider {
    static type = "environment" as const;

    public getValue(key: string): Promise<string | null> {
        return Promise.resolve(process.env[key] as string);
    }
}
