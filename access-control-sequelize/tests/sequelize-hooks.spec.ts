import { SequelizeModule } from "@nestjs/sequelize";
import { Test } from "@nestjs/testing";
import { ResourceEventAccessControlService } from "@lightx-innovations/nestjs-access-control";
import { Sequelize } from "sequelize-typescript";
import { SequelizeHooksAccessControlModule } from "../lib/hooks/sequelize-hooks.module";
import { AccountDevices } from "./models/account-devices";
import { Accounts } from "./models/accounts";
import { Devices } from "./models/devices";

describe("SequelizeHooksModule", () => {
    let resourceEventAccessControlService: any;

    beforeAll(async () => {
        resourceEventAccessControlService = {
            commandBus: null,
            onResourceCreated: jest.fn(),
            onResourceUpdated: jest.fn(),
            onResourceDeleted: jest.fn()
        };

        const moduleRef = await Test.createTestingModule({
            imports: [
                SequelizeModule.forRoot({
                    dialect: "sqlite",
                    storage: ":memory:",
                    database: "test_db",
                    username: "root",
                    password: "",
                    define: {
                        timestamps: true,
                        paranoid: true,
                        underscored: true,
                        updatedAt: "updated_at",
                        createdAt: "created_at",
                        deletedAt: "deleted_at",
                        defaultScope: {
                            attributes: {
                                exclude: ["updated_at", "created_at", "deleted_at"]
                            }
                        }
                    },
                    models: [Accounts, AccountDevices, Devices]
                }),
                SequelizeHooksAccessControlModule
            ]
        })
            .useMocker((token) => {
                if (token === ResourceEventAccessControlService) {
                    return resourceEventAccessControlService;
                }
            })
            .compile();

        await moduleRef.init();

        const sequelize = moduleRef.get(Sequelize);
        await sequelize.sync();
    });

    it("Creating an account should call the onResourceCreated function", async () => {
        const account = await Accounts.create({
            userId: "user_1",
            name: "User 1"
        });
        expect(account).toBeDefined();
        expect(resourceEventAccessControlService.onResourceCreated).toBeCalled();
    });

    it("Updating an account should call the onResourceUpdated function", async () => {
        const account = await Accounts.create({
            userId: "user_to_update",
            name: "User to update"
        });
        expect(account).toBeDefined();

        await account.update({
            name: "User updated"
        });

        await Accounts.update(
            {
                name: "User updated from bulk"
            },
            {
                where: {
                    userId: "user_to_update"
                }
            }
        );

        expect(resourceEventAccessControlService.onResourceUpdated).toBeCalledTimes(2);
    });

    it("Deleting an account should call the onResourceDeleted function", async () => {
        const account = await Accounts.create(
            {
                userId: "user_to_delete",
                name: "User to deleted"
            },
            { hooks: false }
        );
        expect(account).toBeDefined();

        await Accounts.destroy({
            where: {
                userId: "user_to_delete"
            }
        });
        expect(resourceEventAccessControlService.onResourceDeleted).toBeCalled();
    });

    it("Creating a device from an account instance should call the onResourceCreated function", async () => {
        const account = await Accounts.create({
            userId: "user_2",
            name: "User 2"
        });
        expect(account).toBeDefined();

        const device = await account.$create("device", { uniqueId: "unique_id_1", name: "Device 1" });
        expect(device).toBeDefined();

        expect(resourceEventAccessControlService.onResourceCreated).toBeCalled();
    });
});
