export interface SubscriptionBase {
    info: SubscriptionInfoBase;
}

export interface SubscriptionInfoBase {
    id: number;
}
export abstract class SubscriptionAdapter {
    public abstract createSubscription(options: any): SubscriptionBase;
    public abstract removeSubscriptionFromUserId(userId: string): void;
    public abstract rerouteData(baseRoot: string[], data: any | any[]): any[];
}

