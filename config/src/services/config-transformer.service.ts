import { Inject, Injectable, Type } from "@nestjs/common";
import { ConfigHandler } from "../handlers/config.handler";
import { ConfigModelNotFoundError } from "../errors/config-model-not-found.error";
import { EnvironmentConfigProvider } from "../providers/environment.config-provider";
import { ModuleRef } from "@nestjs/core";
import { ConfigProviderHandler } from "../handlers/config-provider.handler";
import { IConfigProvider } from "../providers/config.provider";
import { ConfigProviderNotRegisteredError } from "../errors/config-provider-not-registered.error";
import { ConfigProviderNotFoundInModuleError } from "../errors/config-provider-not-found-in-module.error";
import { OPTIONS } from "../constant";
import { ConfigModuleOptions } from "../config.module";
import { ConfigVariablesNotDefinedError } from "../errors/config-variables-not-defined.error";
import { plainToInstance } from "class-transformer";
import { ConfigMetadata } from "../models";

@Injectable()
export class ConfigTransformerService {
    constructor(@Inject(OPTIONS) private options: ConfigModuleOptions, private moduleRef: ModuleRef) {}

    public async transform<T>(configType: Type<T>): Promise<T | null> {
        const configMetadata = this.getConfigMetadata(configType);
        const configProvider = await this.getConfigProvider(configMetadata.provider ?? EnvironmentConfigProvider.type);

        const config = await this.loadConfig<T>(configType, configProvider);
        if (configProvider.hydrate) {
            await configProvider.hydrate(config as Object);
        }
        return config;
    }

    public async reloadConfig<T extends Object, GetValueOptions>(
        config: T,
        options?: {
            getValue?: GetValueOptions;
        }
    ): Promise<void> {
        const configType = config.constructor as Type<T>;

        const configMetadata = this.getConfigMetadata(configType);
        if (!configMetadata.provider) {
            return;
        }
        const configProvider = await this.getConfigProvider(configMetadata.provider);

        const reloadedConfig = await this.loadConfig<T, GetValueOptions>(configType, configProvider, {
            getValue: options?.getValue
        });

        for (const key in reloadedConfig) {
            if (
                !config.hasOwnProperty(key) ||
                !configMetadata.variables.some((variable) => variable.propertyKey === key)
            ) {
                continue;
            }

            config[key] = reloadedConfig[key];
        }
    }

    private async loadConfig<T, GetValueOptions = any>(
        configType: Type<T>,
        configProvider: IConfigProvider,
        options?: {
            getValue?: GetValueOptions;
        }
    ): Promise<T> {
        const variables = ConfigHandler.getConfig(configType).variables;
        const plainConfig: { [key: string]: any } = {};

        const undefinedVariableNames = [];
        for (const variable of variables) {
            if (!variable.variableName) {
                continue;
            }

            const value = await configProvider.getValue(variable.variableName, options?.getValue);
            if (variable.required && (value === null || value === undefined || value === "")) {
                undefinedVariableNames.push(variable.variableName);
                continue;
            }

            plainConfig[variable.propertyKey] = value;
        }

        if (undefinedVariableNames.length) {
            if (this.options.skipRequiredFieldsCheck) {
                console.log(
                    `The following variable must be defined in config '${configType.name}': ${JSON.stringify(
                        undefinedVariableNames
                    )}. Requirement skipped.`
                );
            } else {
                throw new ConfigVariablesNotDefinedError(configType, undefinedVariableNames);
            }
        }

        return plainToInstance(configType, plainConfig);
    }

    private getConfigMetadata(configType: Type): ConfigMetadata {
        const configMetadata = ConfigHandler.getConfig(configType);
        if (!configMetadata) {
            throw new ConfigModelNotFoundError(configType);
        }

        return configMetadata;
    }

    private async getConfigProvider(provider: string): Promise<IConfigProvider | never> {
        const configProviderType = ConfigProviderHandler.getConfigProvider(
            provider ?? EnvironmentConfigProvider.type
        );
        if (!configProviderType) {
            throw new ConfigProviderNotRegisteredError(provider ?? EnvironmentConfigProvider.type);
        }

        const configProvider = await this.moduleRef.resolve<IConfigProvider>(configProviderType, undefined, {
            strict: false
        });
        if (!configProvider) {
            throw new ConfigProviderNotFoundInModuleError(configProviderType);
        }

        return configProvider;
    }
}
