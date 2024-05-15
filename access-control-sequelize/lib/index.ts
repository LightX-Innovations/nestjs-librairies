import { DynamicModule, Module } from "@nestjs/common";
import { SequelizeDatabaseAdapter } from "./adapters/database.adapter";
import { SequelizeHooksAccessControlModule } from "./hooks/sequelize-hooks.module";

@Module({
    imports: [SequelizeHooksAccessControlModule]
})
export class AccessControlSequelizeModule {
    public static forRoot(): DynamicModule {
        return {
            module: AccessControlSequelizeModule,
            providers: [SequelizeDatabaseAdapter]
        };
    }
}

export * from "./adapters/database.adapter";
export * from "./decorators";
export * from "./hooks/sequelize-hooks.module";
export * from "./repositories/repositories";
