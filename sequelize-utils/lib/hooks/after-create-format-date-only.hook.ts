import { BulkCreateOptions, CreateOptions, Model } from "sequelize";
import { HookReturn } from "sequelize/types/hooks";
import { SequelizeUtils } from "../utils/sequelize.utils";

export function AfterBulkCreateFormatDateOnlyHook<M extends Model>(instances: M[], options: BulkCreateOptions): HookReturn {
    for (const instance of instances) {
        AfterCreateFormatDateOnlyHook(instance, options);
    }
}

export function AfterCreateFormatDateOnlyHook<M extends Model>(instance: M, options: CreateOptions): HookReturn {
    if (!instance) {
        return;
    }

    SequelizeUtils.formatInstanceDateOnly(instance);
}
