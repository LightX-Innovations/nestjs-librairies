import { ConfigModule, ConfigUtils, Variable } from "@lightx-innovations/nestjs-config";
import { SequelizeModule } from "@nestjs/sequelize";
import { Test, TestingModule } from "@nestjs/testing";
import { ConfigSequelizeModule } from "./config-sequelize.module";
import { SequelizeConfig } from "./decorators";
import { ConfigSequelizeModel, ConfigSequelizeModelInjectionToken } from "./models";

@SequelizeConfig()
class SequelizeConfigTest {
    @Variable(false)
    name: string;
}

describe("ConfigSequelizeModule", () => {
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                SequelizeModule.forRoot({
                    dialect: "sqlite",
                    storage: ":memory:",
                    autoLoadModels: true
                }),
                ConfigModule.forRoot(SequelizeConfigTest),
                ConfigSequelizeModule.forRoot()
            ]
        }).compile();
        await moduleRef.init();
    });

    it("Config should be provided in module", async () => {
        const config = moduleRef.get<SequelizeConfigTest>(ConfigUtils.getProviderToken(SequelizeConfigTest));

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(SequelizeConfigTest);
    });
});

describe("ConfigSequelizeModule with custom table name", () => {
    let moduleRef: TestingModule;

    beforeAll(async () => {
        moduleRef = await Test.createTestingModule({
            imports: [
                SequelizeModule.forRoot({
                    dialect: "sqlite",
                    storage: ":memory:",
                    autoLoadModels: true
                }),
                ConfigModule.forRoot(SequelizeConfigTest),
                ConfigSequelizeModule.forRoot({ tableName: "my_custom_table_name" })
            ]
        }).compile();
        await moduleRef.init();
    });

    it("Should use the table with the custom name", () => {
        const config = moduleRef.get<SequelizeConfigTest>(ConfigUtils.getProviderToken(SequelizeConfigTest));

        expect(config).toBeDefined();
        expect(config).toBeInstanceOf(SequelizeConfigTest);

        const repository = moduleRef.get<typeof ConfigSequelizeModel>(ConfigSequelizeModelInjectionToken);
        expect(repository.tableName).toBe("my_custom_table_name");
    });
});
