import { Type } from "@nestjs/common";
import { TranslateAdapter } from "../adapters/translate.adapter";
import { Filter, FilterDefinition, GroupFilter, GroupFilterDefinition } from "./filters";
import { DefaultFilterDefinition } from "./filters/default.filter";
import { FilterConfig, FilterModel } from "./models";
import { ExportTypes } from "../models/export-types.model";
import { DefaultOrderRule } from "./order-rules/default.order-rule";

export abstract class BaseFilter<T> implements FilterModel<T> {
    private _translateService!: TranslateAdapter;

    [name: string]: FilterConfig | unknown;
    public abstract dataDefinition: Type<T>;
    public exportDataDefinition?: Type<T>;
    public defaultFilter?: DefaultFilterDefinition;
    public defaultOrderRule?: DefaultOrderRule;

    public set translateService(translateService: TranslateAdapter) {
        this._translateService = translateService;

        for (const key in this) {
            if (!this.hasOwnProperty(key) || key === "dataDefinition") {
                continue;
            }

            if (Filter.validate(this[key] as FilterDefinition)) {
                (this[key] as Filter).translateService = translateService;
            }
            if (GroupFilter.validate(this[key] as GroupFilterDefinition)) {
                (this[key] as GroupFilter).translateService = translateService;
            }
        }
    }
    public get translateService(): TranslateAdapter {
        return this._translateService;
    }

    public async getExportedFieldsKeys(type?: ExportTypes): Promise<string[]> {
        return [];
    }

    public async getExportedFields(value: T, lang?: string, type?: ExportTypes): Promise<any[]> {
        return [];
    }
}
