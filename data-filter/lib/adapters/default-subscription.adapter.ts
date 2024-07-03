import { SubscriptionAdapter } from "./subscription.adapter";

export class DefaultSubscriptionAdapter extends SubscriptionAdapter {
    public createSubscription(options: any) {}
    public removeSubscriptionFromUserId(userId: string) {}
    public transformData(baseRoot: string[], data: any | any[]): any[] {
        return data;
    }
}
