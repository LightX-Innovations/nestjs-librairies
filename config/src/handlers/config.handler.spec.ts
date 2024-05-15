import { EnvironmentConfig } from "../decorators/config.decorator";
import { Variable } from "../decorators/variable.decorator";
import { ConfigHandler } from "./config.handler";
import { EnvironmentConfigProvider } from "../providers/environment.config-provider";
import { ConfigMetadata, VariableMetadata } from "../models";

@EnvironmentConfig()
class EnvironmentConfigModel {
    @Variable(false)
    DB_HOST?: string;

    @Variable({
        variableName: "DB_NAME",
        required: false
    })
    dbName?: string;

    @Variable
    DB_PORT!: string;
}

describe("ConfigHandler", () => {
    describe("environment config", () => {
        it("Should return a config with the provider set as environment", () => {
            const config = ConfigHandler.getConfig(EnvironmentConfigModel);
            expect(config).toBeDefined();

            const expected = {
                provider: EnvironmentConfigProvider.type,
                variables: [
                    {
                        propertyKey: "DB_HOST",
                        variableName: "DB_HOST",
                        required: false
                    } as VariableMetadata,
                    {
                        propertyKey: "dbName",
                        variableName: "DB_NAME",
                        required: false
                    } as VariableMetadata,
                    {
                        propertyKey: "DB_PORT",
                        variableName: "DB_PORT",
                        required: true
                    } as VariableMetadata
                ]
            } as ConfigMetadata;

            expect(config).toEqual(expected);
        });
    });
});
