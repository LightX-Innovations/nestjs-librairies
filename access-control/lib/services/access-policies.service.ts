import { Inject, Injectable, Logger, Optional, Type } from "@nestjs/common";
import { ModuleRef } from "@nestjs/core";
import { ACCESS_CONTROL_DEFAULT_DATABASE } from "../constant";
import { POLICY_METADATA } from "../decorators/constant";
import { PolicyResources, Users } from "../models";
import { PolicyConfig } from "../models/policy-config.model";
import { AccessPolicy } from "../policies";
import { DatabaseAdaptersRegistry } from "./database-adapters.registry";

@Injectable()
export class AccessPoliciesService {
    private readonly logger = new Logger();

    constructor(
        @Optional() @Inject(ACCESS_CONTROL_DEFAULT_DATABASE) private type: string,
        private readonly moduleRef: ModuleRef,
        private databaseAdaptersRegistry: DatabaseAdaptersRegistry
    ) {}

    private _policies: AccessPolicy[] = [];

    public get policies(): AccessPolicy[] {
        return this._policies;
    }

    public async execute(resourceName: string, user: Users): Promise<PolicyResources> {
        const policy = this._policies.find((x) => x.resourceName === resourceName);
        if (!policy) {
            return PolicyResources.resources([]);
        }

        try {
            this.logger.verbose(`Getting resources for user ${user.id}`, policy.name);
            const res = await policy.getResources(user);
            this.logger.verbose(`Resources found for user ${user.id}`, policy.name);

            if (Array.isArray(res)) {
                return PolicyResources.resources(res);
            }

            return res;
        } catch (e) {
            this.logger.error("", e, policy.name);

            return PolicyResources.resources([]);
        }
    }

    public registerPolicies(...policies: Type<AccessPolicy>[]): void {
        policies.forEach((policy) => this.registerPolicy(policy));
    }

    private registerPolicy(policy: Type<AccessPolicy>): void {
        const instance = this.moduleRef.get(policy, { strict: false });
        if (!instance) {
            return;
        }

        const config = this.reflectModel(policy);
        instance.type = config.type ?? this.type;

        const databaseAdapter = this.databaseAdaptersRegistry.getAdapter(config.type ?? this.type);
        instance.resourceName = databaseAdapter.getResourceName(config.model);
        this._policies.push(instance);
    }

    private reflectModel(policy: Type<AccessPolicy>): PolicyConfig {
        return Reflect.getMetadata(POLICY_METADATA, policy);
    }
}
