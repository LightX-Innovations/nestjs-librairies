import {
    Attributes,
    BulkCreateOptions,
    CreateOptions,
    CreationAttributes,
    DestroyOptions,
    FindOrCreateOptions,
    Identifier,
    UpdateOptions
} from "sequelize";
import { SequelizeEntities } from "../models/sequelize-entities.model";
import { SequelizeReadRepository } from "./database-read-repository";

/**
 * @deprecated You should create your own functions instead
 */
export abstract class SequelizeRepository<T extends SequelizeEntities, CreateDto = CreationAttributes<T>, UpdateDto = Partial<Attributes<T>>> extends SequelizeReadRepository<T> {
    public create<Options>(dto: CreateDto, options?: Options & CreateOptions<Attributes<T>>): Promise<T> {
        return this.repository.create(dto as any, options as any) as unknown as Promise<T>;
    }

    public bulkCreate<Options>(dto: CreateDto[], options?: Options & BulkCreateOptions<Attributes<T>>): Promise<T[]> {
        return this.repository.bulkCreate(dto as any, options as any) as unknown as Promise<T[]>;
    }

    public findOrCreate<Options>(options: FindOrCreateOptions, args?: Options): Promise<[T, boolean]> {
        return this.repository.findOrCreate(options) as Promise<[T, boolean]>;
    }

    public async updateByPk<Options>(identifier: Identifier, dto: UpdateDto, options?: Options & UpdateOptions<Attributes<T>>): Promise<T | null> {
         await this.repository.update(dto as any, {
            where: {
                [this.repository.primaryKeyAttribute]: identifier
            },
            ...options as unknown as any
        });
        return this.findByPk(identifier, { transaction: options?.transaction });
    }

    public async update<Options>(dto: UpdateDto, options?: Options & UpdateOptions<Attributes<T>>): Promise<void> {
        await this.repository.update(dto as any, options as any);
    }

    public async destroyByPk(identifier: Identifier, options?: Omit<DestroyOptions<Attributes<T>>, "where">): Promise<void> {
        await this.repository.destroy({
            where: {
                [this.repository.primaryKeyAttribute]: identifier
            },
            ...(options ?? {})
        });
    }

    public async destroy(options?: DestroyOptions<Attributes<T>>): Promise<void> {
        await this.repository.destroy(options);
    }
}
