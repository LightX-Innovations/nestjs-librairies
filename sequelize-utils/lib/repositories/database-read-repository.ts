import { CountOptions, FindOptions, Identifier } from "sequelize";
import { Attributes } from "sequelize/types/model";
import { SequelizeEntities } from "../models/sequelize-entities.model";

export abstract class SequelizeReadRepository<T extends SequelizeEntities> {
    protected abstract repository: typeof SequelizeEntities<any, any>;

    public findByPk(identifier: Identifier, options?: Omit<FindOptions<Attributes<T>>, "where">): Promise<T | null> {
        return this.repository.findByPk(identifier, options) as unknown as Promise<T | null>;
    }

    public findOne(options?: FindOptions<Attributes<T>>): Promise<T | null> {
        return this.repository.findOne(options) as unknown as Promise<T | null>;
    }

    public findAll(options?: FindOptions<Attributes<T>>): Promise<T[]> {
        return this.repository.findAll(options) as unknown as Promise<T[]>;
    }

    public count(options?: Omit<CountOptions<Attributes<T>>, "group">): Promise<number> {
        return this.repository.count(options);
    }
}
