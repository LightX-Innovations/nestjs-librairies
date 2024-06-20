import { QueryModel } from "../filter/models/query.model";

export interface FilterPageMode {
    number: number;
    size: number;
    offset?: number;
}

export interface FilterSearchModel {
    value: string;
}

export interface OrderModel {
    column: string;
    direction: "asc" | "desc" | "";
    nullLast?: boolean;
}

export interface FilterQueryModel {
    page?: FilterPageMode;
    search?: FilterSearchModel;
    query?: QueryModel;
    order?: OrderModel | OrderModel[];
    data?: object;
    groupBy?: string;
    needSubscription?: boolean;
    expiredAt?: Date;
}

export interface FilterResultModel<T> {
    values: T[];
    total: number;
    page?: {
        number: number;
        size: number;
    };
}
