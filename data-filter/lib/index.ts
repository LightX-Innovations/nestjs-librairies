import { DynamicModule, ForwardReference, Global, Module, Provider, Type } from "@nestjs/common";
import { ExportAdapter } from "./adapters";
import { AccessControlAdapter } from "./adapters/access-control.adapter";
import { DefaultAccessControlAdapter } from "./adapters/default-access-control.adapter";
import { DefaultExportAdapter } from "./adapters/default-export.adapter";
import { DefaultSubscriptionAdapter } from "./adapters/default-subscription.adapter";
import { DefaultTranslateAdapter } from "./adapters/default-translate.adapter";
import { SubscriptionAdapter } from "./adapters/subscription.adapter";
import { TranslateAdapter } from "./adapters/translate.adapter";
import { FILTER_OPTION, VALIDATE_DATA } from "./constant";
import { DataFilterService } from "./data-filter.service";
import { DefaultDeserializer, UserDeserializer } from "./deserializers";
import { FilterUtils } from "./filter";
import { BaseFilter } from "./filter/base-filter";
import { FilterOptionConfig, defaultFilterOptionConfig } from "./filter/filter.config";
import { FilterFactory } from "./filter/filter.factory";
import { createFilterProvider } from "./filter/filter.provider";
import { DataFilterScanner } from "./scanners/data-filter.scanner";
import { SequelizeModelScanner } from "./scanners/sequelize-model.scanner";
import { DataFilterValidationService } from "./services/data-filter-validation.service";

export interface DataFilterConfig {
    imports?: Array<Type | DynamicModule | Promise<DynamicModule> | ForwardReference>;
    providers?: Provider[];
    deserializer?: Provider;
    accessControlAdapter?: Provider;
    subscriptionAdapter?: Provider;
    translateAdapter?: Provider;
    exportAdapter?: Provider;
    filter?: FilterOptionConfig;
    validateData?: boolean;
}

export interface DataFilterFeatureConfig extends DataFilterConfig {
    filters: { filter: Type<BaseFilter<any>>; inject?: any[]; disableAccessControl?: boolean }[];
}

@Global()
@Module({})
export class DataFilterModule {
    public static forRoot(option?: DataFilterConfig): DynamicModule {
        return {
            module: DataFilterModule,
            imports: [...(option?.imports ?? [])],
            providers: [
                DataFilterScanner,
                SequelizeModelScanner,
                DataFilterService,
                ...(option?.providers ?? []),
                {
                    provide: FILTER_OPTION,
                    useValue: {
                        ...defaultFilterOptionConfig,
                        ...(option?.filter ?? {}),
                    },
                },
                {
                    provide: VALIDATE_DATA,
                    useValue: option?.validateData ?? false,
                },
                option?.deserializer ?? {
                    provide: UserDeserializer,
                    useClass: DefaultDeserializer,
                },
                option?.accessControlAdapter ?? {
                    provide: AccessControlAdapter,
                    useClass: DefaultAccessControlAdapter,
                },
                option?.subscriptionAdapter ?? {
                    provide: SubscriptionAdapter,
                    useClass: DefaultSubscriptionAdapter,
                },
                option?.translateAdapter ?? {
                    provide: TranslateAdapter,
                    useClass: DefaultTranslateAdapter,
                },
                option?.exportAdapter ?? {
                    provide: ExportAdapter,
                    useClass: DefaultExportAdapter,
                },
                DataFilterValidationService,
            ],
            exports: [
                FILTER_OPTION,
                UserDeserializer,
                AccessControlAdapter,
                SubscriptionAdapter,
                TranslateAdapter,
                ExportAdapter,
                DataFilterScanner,
                SequelizeModelScanner,
                DataFilterService,
            ],
        };
    }

    public static forFeature(option: DataFilterFeatureConfig): DynamicModule {
        const providerOverride = Object.keys(option)
            .map((x) => {
                if (x === "imports" || x === "filters") {
                    return;
                }
                return (option as any)[x];
            })
            .filter((x) => x);
        return {
            module: DataFilterModule,
            imports: option.imports ?? [],
            providers: [
                ...providerOverride,
                ...option.filters.flatMap((x) => [
                    {
                        provide: x.filter,
                        useFactory: FilterFactory(x.filter),
                        inject: x.inject ?? [],
                    },
                    createFilterProvider(x.filter, x.disableAccessControl),
                ]),
            ],
            exports: [...option.filters.map((x) => FilterUtils.getProviderToken(x.filter))],
        };
    }
}

export * from "./adapters";
export * from "./data-filter.repository";
export * from "./data-filter.service";
export * from "./decorators";
export * from "./deserializers";
export * from "./filter";
export * from "./models/export-types.model";
export * from "./models/filter.model";
export * from "./models/include.model";
export * from "./models/user.model";
