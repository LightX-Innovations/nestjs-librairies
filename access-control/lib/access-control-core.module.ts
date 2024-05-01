import { RedisModule } from "@lightx-innovations/nestjs-redis";
import { Global, Module, OnModuleInit } from "@nestjs/common";
import { CqrsModule } from "@nestjs/cqrs";
import {
    AccessControlGetResourcesHandler,
    AccessControlResourceCreatedHandler,
    AccessControlResourceDeletedHandler,
    AccessControlResourceUpdatedHandler
} from "./handlers";
import { AccessControlResourceAccessUpdatedHandler } from "./handlers/resource-access-updated.handler";
import {
    AccessControlExplorerService,
    AccessControlService,
    AccessPoliciesService,
    DatabaseAdaptersRegistry,
    ResourceAccessService,
    ResourceCreatedPoliciesService,
    ResourceDeletedPoliciesService,
    ResourceEventAccessControlService,
    ResourceUpdatedPoliciesService
} from "./services";
import { AccessControlResourceLoaderService } from "./services/access-control-resource-loader.service";
import { ResourceAccessUpdatedPoliciesService } from "./services/resource-access-updated-policies.service";

@Global()
@Module({
    imports: [CqrsModule, RedisModule],
    providers: [
        AccessControlService,
        AccessPoliciesService,
        AccessControlExplorerService,
        ResourceAccessService,
        ResourceCreatedPoliciesService,
        ResourceDeletedPoliciesService,
        ResourceUpdatedPoliciesService,
        ResourceAccessUpdatedPoliciesService,
        ResourceEventAccessControlService,
        AccessControlGetResourcesHandler,
        AccessControlResourceCreatedHandler,
        AccessControlResourceUpdatedHandler,
        AccessControlResourceDeletedHandler,
        AccessControlResourceAccessUpdatedHandler,
        AccessControlResourceLoaderService
    ],
    exports: [
        CqrsModule,
        RedisModule,
        AccessControlService,
        AccessPoliciesService,
        ResourceEventAccessControlService,
        AccessControlResourceLoaderService
    ]
})
export class AccessControlCoreModule implements OnModuleInit {
    constructor(
        private accessPoliciesService: AccessPoliciesService,
        private databaseAdaptersRegistry: DatabaseAdaptersRegistry,
        private resourceCreatedPoliciesService: ResourceCreatedPoliciesService,
        private resourceDeletedPoliciesService: ResourceDeletedPoliciesService,
        private resourceUpdatedPoliciesService: ResourceUpdatedPoliciesService,
        private resourceAccessUpdatedPoliciesService: ResourceAccessUpdatedPoliciesService,
        private explorer: AccessControlExplorerService
    ) {}

    public onModuleInit(): void {
        const { policies, createdPolicies, updatedPolicies, deletedPolicies, accessUpdatedPolicies, databaseAdapters } =
            this.explorer.explore();
        this.databaseAdaptersRegistry.registerAdapters(...databaseAdapters);
        this.accessPoliciesService.registerPolicies(...policies);
        this.resourceCreatedPoliciesService.registerPolicies(...createdPolicies);
        this.resourceDeletedPoliciesService.registerPolicies(...deletedPolicies);
        this.resourceUpdatedPoliciesService.registerPolicies(...updatedPolicies);
        this.resourceAccessUpdatedPoliciesService.registerPolicies(accessUpdatedPolicies);
    }
}
