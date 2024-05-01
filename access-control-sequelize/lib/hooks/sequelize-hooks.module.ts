import { Module, OnModuleInit } from "@nestjs/common";
import { ResourceEventAccessControlService } from "@recursyve/nestjs-access-control";
import { Model, Sequelize } from "sequelize-typescript";

class M extends Model {}

@Module({})
export class SequelizeHooksAccessControlModule implements OnModuleInit {
    constructor(private sequelize: Sequelize, private readonly resourceEventAccessControlService: ResourceEventAccessControlService<any>) {}

    public onModuleInit(): void {
        for (const model of this.sequelize.modelManager.all) {

            (model as unknown as typeof M).addHook("afterCreate", "access-control-created-policy-hook", async (instance: M, options) => {
                if (options.transaction) {
                    options.transaction.afterCommit(async () => {
                        await this.markAsCreated(model as unknown as typeof M, instance);
                    });
                } else {
                    await this.markAsCreated(model as unknown as typeof M, instance);
                }
            });

            /**
             * After bulk create is called when join tables instance are created (BelongsToMany)
             */
            (model as unknown as typeof M).addHook("afterBulkCreate", "access-control-bulk-created-policy-hook", async (instances: M[], options) => {
                if (options.transaction) {
                    options.transaction.afterCommit(async () => {
                        await Promise.all(
                            instances.map((instance) => this.markAsCreated(model as unknown as typeof M, instance))
                        );
                    });
                } else {
                    await Promise.all(
                        instances.map((instance) => this.markAsCreated(model as unknown as typeof M, instance))
                    );
                }
            });

            /**
             * When updating with bulkUpdate (Ex: Accounts.update({ name: "My New Name" }, { id: 2 })), we need to set individualHooks to true
             * We force it with the beforeBulkUpdate hooks so that we don't need to pass it when making the update with Sequelize
             */
            (model as unknown as typeof M).addHook("beforeBulkUpdate", "access-control-before-update-hook", (options) => {
                options.individualHooks = true;
            });

            (model as unknown as typeof M).addHook("afterUpdate", "access-control-updated-policy-hook", async (instance: M, options) => {
                /**
                 * When a transaction is committed, the previous dataValue is set to the current dataValue.
                 * We compute the previous before to avoid this issue.
                 */
                const previous = new (instance as any).constructor(instance.toJSON()) as M;
                previous.set(instance.previous());

                const run = async () => {
                    await this.resourceEventAccessControlService.onResourceUpdated(`${model.tableName}-sequelize`, previous, instance);
                }

                if (options.transaction) {
                    options.transaction.afterCommit(async () => {
                        await run();
                    });
                } else {
                    await run();
                }
            });

            /**
             * When deleting with bulkDestroy (Ex: Accounts.destroy({ id: 2 })), we need to set individualHooks to true
             * We force it with the beforeBulkDestroy hooks so that we don't need to pass it when using destroy with Sequelize
             */
            (model as unknown as typeof M).addHook("beforeBulkDestroy", "access-control-before-destroy-policy-hook", async (options) => {
                options.individualHooks = true;
            });

            (model as unknown as typeof M).addHook("afterDestroy", "access-control-deleted-policy-hook", async (instance: M, options) => {
                const run = async () => {
                    await this.resourceEventAccessControlService.onResourceDeleted(`${model.tableName}-sequelize`, instance, instance.getDataValue("id"));
                };

                if (options.transaction) {
                    options.transaction.afterCommit(async () => {
                        await run();
                    });
                } else {
                    await run();
                }
            });
        }
    }

    private async markAsCreated(model: typeof M, instance: M): Promise<void> {
        await this.resourceEventAccessControlService.onResourceCreated(`${model.tableName}-sequelize`, instance);
    }
}
