import { ResourceAccessControlService, Resources } from "@lightx-innovations/nestjs-access-control";
import { SequelizeEntities } from "@lightx-innovations/nestjs-sequelize-utils";
import { Attributes, FindOptions, Identifier, Op, WhereOptions } from "sequelize";
import { Sequelize } from "sequelize-typescript";

export class AccessControlRepository<T extends SequelizeEntities> extends ResourceAccessControlService {
    constructor(protected repository: typeof SequelizeEntities<any, any>) {
        super({ model: repository, type: "sequelize" });
    }

    public findByPkFromUser(
        identifier: Identifier,
        resources: Resources,
        options?: FindOptions<Attributes<T>>
    ): Promise<T> {
        const where = {
            [this.repository.primaryKeyAttribute]: identifier
        } as WhereOptions;

        return this.findOneForUser(resources, {
            ...options,
            where: options?.where ? { [Op.and]: [where, options.where] } : where
        });
    }

    public findOneForUser(resources: Resources, options?: FindOptions<Attributes<T>>): Promise<T> {
        const where = this.generateAccessControlWhereOptions(resources, options?.where);

        return this.repository.findOne({
            ...options,
            where
        }) as Promise<T>;
    }

    public findAllFromUser(resources: Resources, options?: FindOptions<Attributes<T>>): Promise<T[]> {
        return this.repository.findAll({
            ...options,
            where: this.generateAccessControlWhereOptions(resources, options?.where)
        }) as unknown as Promise<T[]>;
    }

    public countForUser(resources: Resources, options?: FindOptions<Attributes<T>>): Promise<number> {
        const where = this.generateAccessControlWhereOptions(resources, options?.where);

        return this.repository.count({
            ...options,
            where
        });
    }

    public generateAccessControlWhereOptions(resources: Resources, where?: WhereOptions<T>): WhereOptions {
        if (resources.ids) {
            if (!where) {
                return { id: resources.ids };
            }

            return { [Op.and]: [where, { id: resources.ids }] };
        } else if (resources.where) {
            if (!where) {
                return resources.where;
            }

            return [resources.where, where];
        } else if (resources.all) {
            if (!where) {
                return Sequelize.literal("TRUE");
            }

            return where;
        }

        return Sequelize.literal("FALSE");
    }
}
