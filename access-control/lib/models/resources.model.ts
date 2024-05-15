import { AccessRules } from "./access-rules.model";

export type ResourceId = number | string;

export enum PolicyResourceTypes {
    Wildcard = "wildcard",
    Resources = "resources",
    Condition = "condition"
}

export interface PolicyResourcesCondition<WhereOptions> {
    where: WhereOptions;
    rules: AccessRules;
}

export class PolicyResources {
    public wildcard?: AccessRules;
    public resources?: AccessControlResources[];
    public condition?: PolicyResourcesCondition<any>;

    public get type(): PolicyResourceTypes {
        if (this.wildcard) {
            return PolicyResourceTypes.Wildcard;
        }
        if (this.condition) {
            return PolicyResourceTypes.Condition;
        }

        return PolicyResourceTypes.Resources;
    }

    private constructor({
        wildcard,
        resources,
        condition
    }: {
        wildcard?: AccessRules;
        resources?: AccessControlResources[];
        condition?: PolicyResourcesCondition<any>;
    }) {
        this.wildcard = wildcard;
        this.resources = resources;
        this.condition = condition;
    }

    public static wildcard(rules: AccessRules): PolicyResources {
        return new PolicyResources({ wildcard: rules });
    }

    public static resources(resources: AccessControlResources[]): PolicyResources {
        return new PolicyResources({ resources });
    }

    public static condition(where: any, rules: AccessRules): PolicyResources {
        return new PolicyResources({ condition: { where, rules } });
    }
}

export interface AccessControlResources {
    resourceId: ResourceId;
    rules: AccessRules;
}

export class Resources {
    public all?: boolean;
    public ids?: ResourceId[];
    public where?: any;

    private constructor({ all, ids, where }: { all?: boolean; ids?: ResourceId[]; where?: any }) {
        this.all = all;
        this.ids = ids;
        this.where = where;
    }

    public static all(): Resources {
        return new Resources({ all: true });
    }

    public static fromIds(ids: ResourceId[]): Resources {
        return new Resources({ ids });
    }

    public static fromCondition(where: any): Resources {
        return new Resources({ where });
    }
}
