import { Injectable, NotFoundException } from "@nestjs/common";
import { InjectModel } from "@nestjs/sequelize";
import { Attributes, CreateOptions, CreationAttributes } from "sequelize";
import { SequelizeReadRepository } from "../../lib";
import { Accounts } from "../models/accounts.model";

@Injectable()
export class AccountsService extends SequelizeReadRepository<Accounts> {
    constructor(@InjectModel(Accounts) protected repository: typeof Accounts) {
        super();
    }

    public async create(values: CreationAttributes<Accounts>, options?: CreateOptions<Attributes<Accounts>>): Promise<Accounts> {
        return await this.repository.create(values, options);
    }

    public async test(id: number): Promise<Accounts> {
        await this.repository.update({
            phone: null
        }, {
            where: {
                id: id
            }
        });

        const account = await this.repository.findByPk(id);
        if (!account) {
            throw new NotFoundException();
        }

        return account;
    }
}
