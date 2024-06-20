export abstract class SubscriptionAdapter {
    public abstract createSubscription(options: any): any;
    public abstract removeSubscriptionFromUserId(userId: string): void;
}