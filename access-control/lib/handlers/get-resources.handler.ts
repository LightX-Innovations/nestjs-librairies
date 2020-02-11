import { CommandHandler, ICommandHandler } from "@nestjs/cqrs";
import { GetResourcesCommand } from "../commands";
import { AccessControlResources } from "../models";
import { AccessPoliciesService } from "../services";

@CommandHandler(GetResourcesCommand)
export class AccessControlGetResourcesHandler implements ICommandHandler<GetResourcesCommand> {
    constructor(private accessPolicyService: AccessPoliciesService) {}

    public async execute(command: GetResourcesCommand): Promise<AccessControlResources[]> {
        return await this.accessPolicyService.execute(command.table, command.user);
    }
}