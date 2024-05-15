import { ConfigMetadata } from "../models/config-metadata.model";
import "reflect-metadata";
import { CONFIG } from "../constant";
import { VariableMetadata } from "../models/variable-metadata.model";
import { Type } from "@nestjs/common";

export class ConfigHandler {
    public static getVariable(target: Type, propertyKey: string): VariableMetadata | null {
        const config = ConfigHandler.getConfig(target);
        if (!config?.variables) {
            return null;
        }

        return config.variables.find(variable => variable.propertyKey === propertyKey) ?? null;
    }

    public static saveVariable(target: Type, variableConfig: VariableMetadata): void {
        const config = ConfigHandler.getConfig(target);

        const variableIndex = config.variables.findIndex(variable => variable.propertyKey === variableConfig.propertyKey);
        if (variableIndex >= 0) {
            config.variables[variableIndex] = variableConfig;
        } else {
            config.variables.push(variableConfig);
        }

        ConfigHandler.saveConfig(target, config);
    }

    public static getConfig(target: Type): ConfigMetadata {
        const config: ConfigMetadata = Reflect.getMetadata(CONFIG, target) ?? { variables: [] };
        return {
            ...config,
            variables: config.variables ? [...config.variables] : config.variables
        };
    }

    public static saveConfig(target: Type, config: ConfigMetadata): void {
        Reflect.defineMetadata(CONFIG, config, target);
    }
}
