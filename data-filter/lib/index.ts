import { DynamicModule, forwardRef, ForwardReference, Global, Module, Provider, Type } from "@nestjs/common";
import { ExportAdapter } from "./adapters";
import { AccessControlAdapter } from "./adapters/access-control.adapter";
import { DefaultAccessControlAdapter } from "./adapters/default-access-control.adapter";
import { DefaultExportAdapter } from "./adapters/default-export.adapter";
import { DefaultTranslateAdapter } from "./adapters/default-translate.adapter";
import { TranslateAdapter } from "./adapters/translate.adapter";
import { DataFilterService } from "./data-filter.service";
import { DefaultDeserializer, UserDeserializer } from "./deserializers";
import { FilterUtils } from "./filter";
import { BaseFilter } from "./filter/base-filter";
import { FilterFactory } from "./filter/filter.factory";
import { DataFilterScanner } from "./scanners/data-filter.scanner";
import { SequelizeModelScanner } from "./scanners/sequelize-model.scanner";
import { createFilterProvider } from "./filter/filter.provider";

export interface DataFilterConfig {
    imports?: Array<Type<any> | DynamicModule | Promise<DynamicModule> | ForwardReference>;
    deserializer?: Provider;
    accessControlAdapter?: Provider;
    translateAdapter?: Provider;
    exportAdapter?: Provider;
}

export interface DataFilterFeatureConfig extends DataFilterConfig {
    filters: { filter: Type<BaseFilter<any>>; inject?: any[] }[];
}

@Global()
@Module({
    providers: [DataFilterScanner, SequelizeModelScanner, DataFilterService],
    exports: [DataFilterScanner, SequelizeModelScanner, DataFilterService]
})
export class DataFilterModule {
    public static forRoot(option?: DataFilterConfig): DynamicModule {
        option = {
            imports: option?.imports ?? [],
            deserializer: option?.deserializer ?? {
                provide: UserDeserializer,
                useClass: DefaultDeserializer
            },
            accessControlAdapter: option?.accessControlAdapter ?? {
                provide: AccessControlAdapter,
                useClass: DefaultAccessControlAdapter
            },
            translateAdapter: option?.translateAdapter ?? {
                provide: TranslateAdapter,
                useClass: DefaultTranslateAdapter
            },
            exportAdapter: option?.exportAdapter ?? {
                provide: ExportAdapter,
                useClass: DefaultExportAdapter
            }
        };
        return {
            module: DataFilterModule,
            imports: [...option.imports],
            providers: [
                option.deserializer,
                option.accessControlAdapter,
                option.translateAdapter,
                option.exportAdapter
            ],
            exports: [
                UserDeserializer,
                AccessControlAdapter,
                TranslateAdapter,
                ExportAdapter
            ]
        };
    }

    public static forFeature(option: DataFilterFeatureConfig): DynamicModule {
        const providerOverride = Object.keys(option).map(x => {
            if (x === "imports" || x === "filters") {
                return;
            }
            return option[x];
        }).filter(x => x);
        return {
            module: DataFilterModule,
            imports: option.imports ?? [],
            providers: [
                ...providerOverride,
                ...option.filters.flatMap(x => ([
                    {
                        provide: x.filter,
                        useFactory: FilterFactory(x.filter),
                        inject: x.inject ?? []
                    },
                    createFilterProvider(x.filter)
                ]))
            ],
            exports: [
                ...option.filters.map(x => FilterUtils.getProviderToken(x.filter))
            ]
        };
    }
}

export * from "./data-filter.service";
export * from "./data-filter.repository";
export * from "./adapters";
export * from "./decorators";
export * from "./deserializers";
export * from "./filter";
export * from "./models/export-types.model";
export * from "./models/filter.model";
export * from "./models/include.model";
export * from "./models/user.model";
