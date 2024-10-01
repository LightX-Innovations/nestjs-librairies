import { DynamicModule, Module } from "@nestjs/common";
import { SequelizeDatabaseAdapter } from "./adapters/database.adapter";
import { SequelizeHooksAccessControlModule } from "./hooks/sequelize-hooks.module";
import { Model } from "sequelize-typescript";

@Module({
    imports: [SequelizeHooksAccessControlModule]
})
export class AccessControlSequelizeModule {
    public static forRoot(options: { filterModelCallback?: (model: Model) => boolean }): DynamicModule {
        return {
            module: AccessControlSequelizeModule,
            providers: [
                {
                    provide: SequelizeDatabaseAdapter,
                    useFactory: () => new SequelizeDatabaseAdapter(options.filterModelCallback)
                }
            ]
        };
    }
}

export * from "./adapters/database.adapter";
export * from "./decorators";
export * from "./hooks/sequelize-hooks.module";
export * from "./repositories/repositories";
