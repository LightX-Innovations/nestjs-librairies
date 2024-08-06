import { FilterQueryModel } from "../models/filter.model";

export interface SubscriptionBase {
    info: SubscriptionInfoBase;
}

export interface SubscriptionInfoBase {
    id: number;
}
export abstract class SubscriptionAdapter {
    public abstract createSubscription(options: any): SubscriptionBase;
    public abstract rerouteData(baseRoot: string[], filterQuery: FilterQueryModel, data: any | any[]): any[];
}
