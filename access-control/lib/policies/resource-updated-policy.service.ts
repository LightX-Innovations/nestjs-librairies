import { Injectable } from "@nestjs/common";
import { UserResources } from "../models";

@Injectable()
export abstract class ResourceUpdatedPolicy<T> {
    public type!: string;
    public resourceName!: string;
    public parentResourceName!: string;

    public get name(): string {
        return (this as any).constructor.name;
    }

    public async handle(before: T, after: T): Promise<UserResources[]> {
        const result = await this.getPolicies(before, after);
        return result
            .filter(x => !!x)
            .map(x => ({ ...x, resourceName: this.resourceName }));
    }

    protected async getPolicies(before: T, after: T): Promise<UserResources[]> {
        return [];
    }
}
