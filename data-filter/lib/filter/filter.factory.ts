import { Type } from "@nestjs/common";
import { AccessControlAdapter } from "../adapters/access-control.adapter";
import { TranslateAdapter } from "../adapters/translate.adapter";
import { DataFilterService } from "../data-filter.service";
import { SequelizeModelScanner } from "../scanners/sequelize-model.scanner";
import { BaseFilter } from "./base-filter";
import { FilterService } from "./filter.service";

export function FilterServiceFactory<T>(options?: { disableAccessControl?: boolean }) {
    return (
        accessControlAdapter: AccessControlAdapter,
        translateAdapter: TranslateAdapter,
        filter: BaseFilter<T>,
        sequelizeModelScanner: SequelizeModelScanner,
        dataFilterService: DataFilterService
    ) => {
        return new FilterService(accessControlAdapter, translateAdapter, filter, sequelizeModelScanner, dataFilterService, options);
    }
}

export function FilterFactory<T>(filter: Type<T>) {
    return (...args: any[]) => {
        /**
         * Check if all dependencies are injected
         */
        if (filter.prototype.constructor.length !== args.length) {
            throw new Error(`Not enough dependencies were provided for ${filter.name}: expected ${filter.prototype.constructor.length}, received ${args.length}`)
        }

        return new filter(...args);
    };
}
