import { FilterQueryModel } from "../models/filter.model";
import { SubscriptionAdapter, SubscriptionBase } from "./subscription.adapter";

export class DefaultSubscriptionAdapter extends SubscriptionAdapter {
    public createSubscription(options: any): SubscriptionBase {
        return {
            info: {
                id: -1,
            },
        };
    }
    public rerouteData(baseRoot: string[], filterQuery: FilterQueryModel, data: any | any[]): any[] {
        return data;
    }
}
