import { Injectable } from "@nestjs/common";
import { PolicyResources, Users } from "../models";

@Injectable()
export abstract class AccessPolicy {
    public type!: string;
    public resourceName!: string;

    public get name(): string {
        return (this as any).constructor.name;
    }

    public async getResources(user: Users): Promise<PolicyResources> {
        return PolicyResources.resources([]);
    }
}
