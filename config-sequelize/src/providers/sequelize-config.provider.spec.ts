import { ConfigMetadata, ConfigModule, Variable } from "@lightx-innovations/nestjs-config";
import { ConfigHandler } from "@lightx-innovations/nestjs-config/handlers/config.handler";
import { VariableMetadata } from "@lightx-innovations/nestjs-config/models/variable-metadata.model";
import { ConfigTransformerService } from "@lightx-innovations/nestjs-config/services/config-transformer.service";
import { SequelizeModule } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { Type } from "class-transformer";
import { ConfigSequelizeModule } from "../config-sequelize.module";
import { SequelizeConfig } from "../decorators";
import { ConfigSequelizeModel, ConfigSequelizeModelInjectionToken, ManageableSequelizeConfig } from "../models";
import { SequelizeConfigProvider } from "./sequelize.config-provider";

@SequelizeConfig()
class SequelizeConfigModel1 {
    @Variable("REDIS_HOST")
    redisHost: string;

    @Variable({
        required: false
    })
    REDIS_PORT: string;

    @Variable
    redisPassword: string;
}

@SequelizeConfig()
class ManageableSequelizeConfig1 extends ManageableSequelizeConfig<ManageableSequelizeConfig1> {
    @Variable
    first: string;

    @Variable
    @Type(() => Number)
    second: number;

    @Variable("not_three")
    three: string;
}

@SequelizeConfig()
class SequelizeConfigModel2 {
    @Variable("SEQUELIZE_FIRST_VAR")
    firstVar: string;

    @Variable
    SEQUELIZE_SECOND_VAR: string;

    @Variable(true)
    sequelizeThirdVar: string;
}

describe("SequelizeConfigProvider", () => {
    let moduleRef: TestingModule;
    let configService: ConfigTransformerService;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                SequelizeModule.forRoot({
                    dialect: "sqlite",
                    storage: ":memory:",
                    autoLoadModels: true
                }),
                ConfigModule.forRoot(),
                ConfigSequelizeModule.forRoot()
            ]
        }).compile();
        await moduleRef.init();

        configService = moduleRef.get(ConfigTransformerService);
    });

    beforeEach(async () => {
        const repository = moduleRef.get<typeof ConfigSequelizeModel>(ConfigSequelizeModelInjectionToken);
        await repository.destroy({ where: {} });
    });

    it("Should return a config with the provider set as environment", () => {
        const config = ConfigHandler.getConfig(SequelizeConfigModel1);
        expect(config).toBeDefined();

        const expected = {
            provider: SequelizeConfigProvider.type,
            variables: [
                {
                    propertyKey: "redisHost",
                    variableName: "REDIS_HOST",
                    required: true
                } as VariableMetadata,
                {
                    propertyKey: "REDIS_PORT",
                    variableName: "REDIS_PORT",
                    required: false
                } as VariableMetadata,
                {
                    propertyKey: "redisPassword",
                    variableName: "redisPassword",
                    required: true
                } as VariableMetadata
            ]
        } as ConfigMetadata;

        expect(config).toEqual(expected);
    });

    it("transform should return the config from sequelize if the provider is sequelize", async () => {
        const repository = moduleRef.get<typeof ConfigSequelizeModel>(ConfigSequelizeModelInjectionToken);
        await repository.bulkCreate([
            { key: "SEQUELIZE_FIRST_VAR", value: "sequelize_first_value" },
            { key: "SEQUELIZE_SECOND_VAR", value: "sequelize_second_value" },
            { key: "sequelizeThirdVar", value: "sequelize_third_value" }
        ]);

        const config = await configService.transform(SequelizeConfigModel2);

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(SequelizeConfigModel2);
        expect(config).toEqual({
            firstVar: "sequelize_first_value",
            SEQUELIZE_SECOND_VAR: "sequelize_second_value",
            sequelizeThirdVar: "sequelize_third_value"
        });
    });

    it("should reload the config", async () => {
        const repository = moduleRef.get<typeof ConfigSequelizeModel>(ConfigSequelizeModelInjectionToken);
        await repository.bulkCreate([
            { key: "first", value: "first_value" },
            { key: "second", value: "42" },
            { key: "not_three", value: "3" }
        ]);

        const config = await configService.transform(ManageableSequelizeConfig1);

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(ManageableSequelizeConfig1);
        expect(config).toMatchObject({
            first: "first_value",
            second: 42,
            three: "3"
        });

        await repository.update({ value: "updated_first_value" }, { where: { key: "first" } });

        await config.reload();

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(ManageableSequelizeConfig1);
        expect(config).toMatchObject({
            first: "updated_first_value",
            second: 42,
            three: "3"
        });

        await repository.update({ value: "re_updated_first_value" }, { where: { key: "first" } });
        await repository.update({ value: 1024 }, { where: { key: "second" } });
        await repository.update({ value: "42" }, { where: { key: "not_three" } });

        await config.reload();

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(ManageableSequelizeConfig1);
        expect(config).toMatchObject({
            first: "re_updated_first_value",
            second: 1024,
            three: "42"
        });
    });

    it("should update the config", async () => {
        const repository = moduleRef.get<typeof ConfigSequelizeModel>(ConfigSequelizeModelInjectionToken);
        await repository.bulkCreate([
            { key: "first", value: "first_value" },
            { key: "second", value: "42" },
            { key: "not_three", value: "4" }
        ]);

        const config = await configService.transform(ManageableSequelizeConfig1);

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(ManageableSequelizeConfig1);
        expect(config).toMatchObject({
            first: "first_value",
            second: 42,
            three: "4"
        });

        await config.update({
            first: "updated_first_value"
        });

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(ManageableSequelizeConfig1);
        expect(config).toMatchObject({
            first: "updated_first_value",
            second: 42,
            three: "4"
        });

        const [first, second, three] = await Promise.all([
            repository.findOne({ where: { key: "first" } }),
            repository.findOne({ where: { key: "second" } }),
            repository.findOne({ where: { key: "not_three" } })
        ]);
        expect(first?.value).toEqual("updated_first_value");
        expect(second?.value).toEqual("42");
        expect(three?.value).toEqual("4");

        await config.update({
            first: "re_updated_first_value",
            second: 2048
        });

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(ManageableSequelizeConfig1);
        expect(config).toMatchObject({
            first: "re_updated_first_value",
            second: 2048,
            three: "4"
        });

        const [first1, second1, three1] = await Promise.all([
            repository.findOne({ where: { key: "first" } }),
            repository.findOne({ where: { key: "second" } }),
            repository.findOne({ where: { key: "not_three" } })
        ]);
        expect(first1?.value).toEqual("re_updated_first_value");
        expect(second1?.value).toEqual("2048");
        expect(three1?.value).toEqual("4");

        await config.update({
            first: "re_updated_first_value",
            second: 2048,
            three: "42"
        });

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(ManageableSequelizeConfig1);
        expect(config).toMatchObject({
            first: "re_updated_first_value",
            second: 2048,
            three: "42"
        });

        const [first2, second2, three2] = await Promise.all([
            repository.findOne({ where: { key: "first" } }),
            repository.findOne({ where: { key: "second" } }),
            repository.findOne({ where: { key: "not_three" } })
        ]);
        expect(first2?.value).toEqual("re_updated_first_value");
        expect(second2?.value).toEqual("2048");
        expect(three2?.value).toEqual("42");
    });
});
