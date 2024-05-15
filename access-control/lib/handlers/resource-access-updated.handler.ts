import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { ResourceAccessUpdatedCommand } from "../commands";
import { UserResources } from "../models";
import { ResourceAccessService } from "../services";
import { ResourceAccessUpdatedPoliciesService } from "../services/resource-access-updated-policies.service";

@CommandHandler(ResourceAccessUpdatedCommand)
export class AccessControlResourceAccessUpdatedHandler implements ICommandHandler<ResourceAccessUpdatedCommand> {
    constructor(
        private resourceAccessUpdatedPolicyService: ResourceAccessUpdatedPoliciesService,
        private resourceAccessService: ResourceAccessService
    ) {}

    public async execute(command: ResourceAccessUpdatedCommand): Promise<void> {
        if (!command.userResources.length) {
            return;
        }

        const userResourcesByResourceMap = new Map<string, UserResources[]>();
        for (const userResource of command.userResources) {
            const key = `${userResource.resourceName}:${userResource.resourceId}`;
            if (userResourcesByResourceMap.has(key)) {
                userResourcesByResourceMap.get(key)?.push(userResource);
            } else {
                userResourcesByResourceMap.set(key, [userResource]);
            }
        }

        const userResourcesByResource = [...userResourcesByResourceMap.values()];
        const nestedUserResources = await Promise.all(
            userResourcesByResource.map((userResources) =>
                this.resourceAccessUpdatedPolicyService.execute(
                    userResources[0].resourceName!,
                    userResources[0].resourceId,
                    userResources
                )
            )
        );
        const flattenedUserResources: UserResources[] = [];
        for (const [index, userResources] of nestedUserResources.entries()) {
            const sourceResourceName = userResourcesByResource[index][0].resourceName;

            for (const userResource of userResources) {
                if (userResource.resourceName === sourceResourceName) {
                    throw new Error(`Recursive policy detected for resource '${sourceResourceName}'`);
                }

                flattenedUserResources.push(userResource);
            }
        }

        if (!flattenedUserResources?.length) {
            return;
        }

        await this.resourceAccessService.updateUserResources(flattenedUserResources);
    }
}
