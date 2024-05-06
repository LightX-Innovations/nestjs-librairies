import { ResourceAccessControlService } from "@lightx-innovations/nestjs-access-control";
import { Injectable } from "@nestjs/common";
import { InjectModel, SequelizeModule } from "@nestjs/sequelize";
import { Test } from "@nestjs/testing";
import { Sequelize } from "sequelize-typescript";
import { AccessControlRepository } from "../lib/repositories/access-control.repository";
import { AccountDevices } from "./models/account-devices";
import { Accounts } from "./models/accounts";
import { Devices } from "./models/devices";

@Injectable()
class AccountsService extends AccessControlRepository<Accounts> {
    constructor(@InjectModel(Accounts) repository: typeof Accounts) {
        super(repository);
    }
}

describe.skip("mixinAccessControlRepository", () => {
    let resourceAccessControlService;
    let service: AccountsService;

    beforeAll(async () => {
        resourceAccessControlService = {
            getResources: jest.fn()
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
                    }
                }),
                SequelizeModule.forFeature([Accounts, AccountDevices, Devices])
            ],
            providers: [AccountsService]
        })
            .useMocker((token) => {
                if (token === ResourceAccessControlService) {
                    return resourceAccessControlService;
                }
            })
            .compile();

        await moduleRef.init();

        const sequelize = moduleRef.get(Sequelize);
        await sequelize.sync();

        service = moduleRef.get(AccountsService);
    });

    it("service should be defined", async () => {
        expect(service).toBeDefined();
        expect(service["resourceAccessControlService"]).toBeDefined();
    });
});
