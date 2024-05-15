import { DataFilterUserModel } from "../..";
import { FilterType } from "../type";
import { SelectOperators } from "../operators";
import { BaseFilterDefinition, Filter } from "./filter";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";

export interface SelectFilterValue {
    id: number | string;
    name: string;
}

export interface SelectFilterGetValuesOptions<T = any, User = DataFilterUserModel, Request = any> {
    value: T;
    user?: User;
    request?: Request
}

export interface SelectFilterGetResourceOptions<User = DataFilterUserModel, Request = any> {
    id: number | string;
    user?: User;
    request?: Request
}

export interface SelectFilterDefinition<T> {
    values: ({ value, user, request }: SelectFilterGetValuesOptions) => Promise<SelectFilterValue[]>;
    lazyLoading?: boolean;
    getResourceById?: ({ id, user, request }: SelectFilterGetResourceOptions) => Promise<SelectFilterValue | null>;
}

export class SelectFilter<T> extends Filter implements SelectFilterDefinition<T> {
    public type = FilterType.Select;
    public operators = [...SelectOperators];
    public values!: ({ value, user, request }: SelectFilterGetValuesOptions) => Promise<SelectFilterValue[]>;
    public getResourceById!: ({ id, user, request }: SelectFilterGetResourceOptions) => Promise<SelectFilterValue | null>;
    public lazyLoading!: boolean;

    constructor(definition: BaseFilterDefinition & SelectFilterDefinition<T>) {
        super(definition);

        if (definition.lazyLoading === undefined) {
            this.lazyLoading = true;
        }
    }

    public async getConfig<Request>(key: string, request: Request, user?: DataFilterUserModel): Promise<FilterBaseConfigurationModel | null> {
        const config = await super.getConfig(key, request, user);
        if (!config) {
            return null;
        }

        return {
            ...config,
            values: this.lazyLoading ? [] : await this.values({ value: null, user, request }),
            lazyLoading: this.lazyLoading
        };
    }
}
