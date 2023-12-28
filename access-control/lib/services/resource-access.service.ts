import { RedisService } from "@lightxinnovations/nestjs-redis";
import { Injectable, Logger } from "@nestjs/common";
import { CommandBus } from "@nestjs/cqrs";
import { ResourceAccessUpdatedCommand } from "../commands";
import {
    AccessActionType,
    AccessControlResources,
    PolicyResourceTypes,
    PolicyResources,
    ResourceId,
    UserResources,
    Users,
    accessActionTypeValues
} from "../models";
import { RedisKeyUtils } from "../utils";

@Injectable()
export class ResourceAccessService {
    private logger = new Logger(ResourceAccessService.name);

    constructor(private redisService: RedisService, private commandBus: CommandBus) {}

    public async setUserAccessRules(
        user: Users,
        resourceName: string,
        policyResources: PolicyResources
    ): Promise<void> {
        await this.setUserAccessControlType(user, resourceName, policyResources.type);

        switch (policyResources.type) {
            case PolicyResourceTypes.Resources:
                await Promise.all(
                    accessActionTypeValues.map((action) =>
                        this.setUserAccessActions(user, resourceName, policyResources.resources, action)
                    )
                );
                await this.setUserResourceIdsRules(user, resourceName, policyResources.resources);
                break;
            case PolicyResourceTypes.Condition:
                await this.redisService.set(
                    RedisKeyUtils.userResourceActionConditionKey(user, resourceName),
                    JSON.stringify(policyResources.condition)
                );
                break;
            case PolicyResourceTypes.Wildcard:
                await this.redisService.set(
                    RedisKeyUtils.userResourceActionWildcardKey(user, resourceName),
                    JSON.stringify(policyResources.wildcard)
                );
                break;
        }
    }

    public async addUserResources(userResources: UserResources[]): Promise<void> {
        const filteredUserResources = await this.filterOutUninitializedUserResources(userResources);

        await Promise.all(
            accessActionTypeValues.map((action) => {
                return this.addUserResourceAccessesAction(filteredUserResources, action);
            })
        );

        await Promise.all(
            filteredUserResources.map((userResource) =>
                this.setUserResourceIdsRules(
                    { id: userResource.userId, role: userResource.userRole },
                    userResource.resourceName,
                    [{ resourceId: userResource.resourceId, rules: userResource.rules }]
                )
            )
        );

        await this.commandBus.execute(new ResourceAccessUpdatedCommand(filteredUserResources));
    }

    public async updateUserResources(userResources: UserResources[]): Promise<void> {
        const filteredUserResources = await this.filterOutUninitializedUserResources(userResources);

        const delKeys = new Map(
            filteredUserResources.map((userResource) => [
                RedisKeyUtils.userResourceIdKey(userResource.resourceName, userResource.resourceId, {
                    id: userResource.userId,
                    role: userResource.userRole
                }),
                true
            ])
        );
        if (delKeys.size) {
            await this.redisService.del(...delKeys.keys());
        }

        await Promise.all(
            accessActionTypeValues.map((a) => this.updateUserResourceAccessAction(filteredUserResources, a))
        );

        await Promise.all(
            filteredUserResources.map((userResource) =>
                this.setUserResourceIdsRules(
                    { id: userResource.userId, role: userResource.userRole },
                    userResource.resourceName,
                    [{ resourceId: userResource.resourceId, rules: userResource.rules }]
                )
            )
        );

        await this.commandBus.execute(new ResourceAccessUpdatedCommand(filteredUserResources));
    }

    public async deleteResourceAccesses(resourceName: string, resourceId: ResourceId): Promise<void> {
        await this.redisService.scanDel(RedisKeyUtils.userResourceIdPattern(resourceName, resourceId));
    }

    private async setUserAccessControlType(
        user: Users,
        resourceName: string,
        type: PolicyResourceTypes
    ): Promise<void> {
        await Promise.all([
            this.redisService.set(RedisKeyUtils.userAccessControl(user, resourceName), "1"),
            this.redisService.set(RedisKeyUtils.userAccessControlType(user, resourceName), type)
        ]);
    }

    private async filterOutUninitializedUserResources(userResources: UserResources[]): Promise<UserResources[]> {
        const groupedUserResources: Record<string, UserResources[]> = {};
        for (const userResource of userResources) {
            const key = RedisKeyUtils.userAccessControl(
                { id: userResource.userId, role: userResource.userRole },
                userResource.resourceName
            );
            if (!groupedUserResources[key]) {
                groupedUserResources[key] = [userResource];
            } else {
                groupedUserResources[key].push(userResource);
            }
        }

        const groupedUserResourcesEntries = Object.entries(groupedUserResources);
        if (!groupedUserResourcesEntries.length) {
            return [];
        }

        const hasAccessControls = await this.redisService.mget(...groupedUserResourcesEntries.map(([key, _]) => key));

        const filteredUserResources: UserResources[] = [];

        for (const [index, [_, userResources]] of groupedUserResourcesEntries.entries()) {
            if (hasAccessControls[index] !== "1") {
                this.logger.verbose(
                    `User '${userResources[0].userId}' was filtered out from '${userResources[0].resourceName}' access changes, since his access control was not yet initialized.`
                );
                continue;
            }

            filteredUserResources.push(...userResources);
        }

        return filteredUserResources;
    }

    private async addUserResourceAccessesAction(resources: UserResources[], action: AccessActionType): Promise<void> {
        const resourceIdsByCacheKey = new Map<string, string[]>();
        for (const userResource of resources) {
            if (!userResource.rules[action]) {
                continue;
            }

            const cacheKey = RedisKeyUtils.userResourceActionKey(
                { id: userResource.userId, role: userResource.userRole },
                userResource.resourceName,
                action
            );
            if (resourceIdsByCacheKey.has(cacheKey)) {
                resourceIdsByCacheKey.get(cacheKey).push(userResource.resourceId.toString());
            } else {
                resourceIdsByCacheKey.set(cacheKey, [userResource.resourceId.toString()]);
            }
        }

        await Promise.all(
            [...resourceIdsByCacheKey.entries()].map(([key, resourceIds]) =>
                this.redisService.lpush(key, ...resourceIds)
            )
        );
    }

    private async setUserAccessActions(
        user: Users,
        resourceName: string,
        resources: AccessControlResources[],
        action: AccessActionType
    ): Promise<void> {
        await this.deleteUserResourceAccessesAction(user, resourceName, action);

        const userResources: UserResources[] = resources.map((resource) => ({
            ...resource,
            userId: user.id,
            userRole: user.role,
            resourceName
        }));
        await this.addUserResourceAccessesAction(userResources, action);
    }

    private async updateUserResourceAccessAction(
        userResources: UserResources[],
        action: AccessActionType
    ): Promise<void> {
        await this.addUserResourceAccessesAction(userResources, action);

        const resourcesToRemove = userResources.filter((resource) => !resource.rules[action]);
        await Promise.all(
            resourcesToRemove.map((userResource) =>
                this.deleteUserResourceAccessAction(
                    {
                        id: userResource.userId,
                        role: userResource.userRole
                    },
                    { id: userResource.resourceId, name: userResource.resourceName },
                    action
                )
            )
        );
    }

    private async deleteUserResourceAccessAction(
        user: Users,
        resource: { name: string; id: ResourceId },
        action: AccessActionType
    ): Promise<void> {
        await this.redisService.lrem(
            RedisKeyUtils.userResourceActionKey(user, resource.name, action),
            resource.id.toString()
        );
    }

    private async deleteUserResourceAccessesAction(
        user: Users,
        resourceName: string,
        action: AccessActionType
    ): Promise<void> {
        await this.redisService.del(RedisKeyUtils.userResourceActionKey(user, resourceName, action));
    }

    private async setUserResourceIdsRules(
        user: Users,
        resourceName: string,
        resources: AccessControlResources[]
    ): Promise<void> {
        await Promise.all(
            resources.map(async (resource) => {
                await this.redisService.set(
                    RedisKeyUtils.userResourceIdKey(resourceName, resource.resourceId, user),
                    JSON.stringify(resource.rules)
                );
            })
        );
    }
}
