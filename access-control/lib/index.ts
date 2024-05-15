import { DynamicModule, Global, Module, Provider } from "@nestjs/common";
import { ModuleMetadata } from "@nestjs/common/interfaces";
import { APP_GUARD } from "@nestjs/core";
import { AccessControlCoreModule } from "./access-control-core.module";
import { ACCESS_CONTROL_DEFAULT_DATABASE } from "./constant";
import { DefaultDeserializer, UserDeserializer } from "./deserializers";
import { AccessControlGuard } from "./guards";
import { DatabaseAdaptersRegistry } from "./services";

export interface AccessControlConfig extends Pick<ModuleMetadata, 'imports'> {
    deserializer?: Provider;
    defaultDatabaseType?: string;
}

@Global()
@Module({})
export class AccessControlModule {
    public static forRoot(option: AccessControlConfig): DynamicModule {
        return {
            module: AccessControlModule,
            imports: [AccessControlCoreModule, ...(option.imports ?? [])],
            providers: [
                option.deserializer ?? { provide: UserDeserializer, useClass: DefaultDeserializer },
                DatabaseAdaptersRegistry,
                {
                    provide: ACCESS_CONTROL_DEFAULT_DATABASE,
                    useValue: option.defaultDatabaseType ?? null
                },
                {
                    provide: APP_GUARD,
                    useClass: AccessControlGuard
                }
            ],
            exports: [UserDeserializer, DatabaseAdaptersRegistry, ACCESS_CONTROL_DEFAULT_DATABASE]
        };
    }
}

export * from "./adapters";
export * from "./commands";
export * from "./decorators";
export * from "./deserializers";
export * from "./guards";
export * from "./interfaces";
export * from "./models";
export * from "./policies";
export * from "./services";
export * from "./utils";
