import { FilterType } from "../type";
import { SelectOperators } from "../operators";
import { BaseFilterDefinition, Filter } from "./filter";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";

export interface SelectFilterValue {
    id: number | string;
    name: string;
}

export interface SelectFilterDefinition<T> {
    values: (value: unknown) => Promise<SelectFilterValue[]>;
    lazyLoading?: boolean;
    getResourceById?: (id: number) => Promise<SelectFilterValue>;
}

export class SelectFilter<T> extends Filter implements SelectFilterDefinition<T> {
    public type = FilterType.Select;
    public operators = [...SelectOperators];
    public values: (value: unknown) => Promise<SelectFilterValue[]>;
    public getResourceById: (id: number) => Promise<SelectFilterValue>;
    public lazyLoading;

    constructor(definition: BaseFilterDefinition & SelectFilterDefinition<T>) {
        super(definition);

        if (this.lazyLoading === undefined) {
            this.lazyLoading = true;
        }
    }

    public async getConfig(key: string): Promise<FilterBaseConfigurationModel> {
        const config = await super.getConfig(key);
        return {
            ...config,
            values: this.lazyLoading ? [] : await this.values(null),
            lazyLoading: this.lazyLoading
        };
    }
}
