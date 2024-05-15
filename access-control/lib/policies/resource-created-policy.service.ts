import { Injectable } from "@nestjs/common";
import { UserResources } from "../models";

@Injectable()
export abstract class ResourceCreatedPolicy<T> {
    public type!: string;
    public resourceName!: string;
    public parentResourceName!: string;

    public get name(): string {
        return (this as any).constructor.name;
    }

    public async handle(resource: T): Promise<UserResources[]> {
        const result = await this.getPolicies(resource);
        return result
            .filter(x => !!x)
            .map(x => ({ ...x, resourceName: this.resourceName }));
    }

    protected async getPolicies(resource: T): Promise<UserResources[]> {
        return [];
    }
}
