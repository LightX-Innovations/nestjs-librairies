import { SubscriptionAdapter, SubscriptionBase } from "./subscription.adapter";

export class DefaultSubscriptionAdapter extends SubscriptionAdapter {
    public createSubscription(options: any): SubscriptionBase {
        return {
            info: {
                id: -1,
            },
        };
    }
    public removeSubscriptionFromUserId(userId: string) { }
    public rerouteData(baseRoot: string[], data: any | any[]): any[] {
        return data;
    }
}
