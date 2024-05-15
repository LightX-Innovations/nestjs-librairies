import { Inject } from "@nestjs/common";
import { AccessControlService, ResourceAccessControlService, Resources, Users } from "@recursyve/nestjs-access-control";
import { SequelizeEntities, SequelizeReadRepository, SequelizeRepository } from "@recursyve/nestjs-sequelize-utils";
import { Attributes, FindOptions, Identifier, Op, WhereOptions } from "sequelize";

export class AccessControlRepository<T extends SequelizeEntities> extends ResourceAccessControlService {
    constructor(protected repository: typeof SequelizeEntities<any, any>) {
        super({ model: repository, type: "sequelize" });
    }

    public async findByPkFromUser(identifier: Identifier, resources: Resources, options?: FindOptions<Attributes<T>>): Promise<T | null> {
        if (resources.ids) {
            if (!resources.ids.some((resourceId) => resourceId === identifier)) {
                return null;
            }

            return this.repository.findByPk(identifier, options) as unknown as T;
        }

        if (resources.where) {
            if (!options) {
                options = {};
            }

            if (options.where) {
                options.where = {
                    [Op.and]: [options.where, resources.where]
                }
            } else {
                options.where = resources.where;
            }
        }

        return this.repository.findByPk(identifier, options) as unknown as T;
    }

    public async findOneForUser(resources: Resources, options?: FindOptions<Attributes<T>>): Promise<T> {
        const where = await this.mergeAccessControlCondition(options?.where ?? {}, resources);

        return this.repository.findOne({
            ...options,
            where
        }) as unknown as T;
    }

    public async findAllFromUser(resources: Resources, options?: FindOptions<Attributes<T>>): Promise<T[]> {
        if (!options) {
            options = {};
        }
        return this.repository.findAll({
            ...options,
            where: await this.mergeAccessControlCondition(options.where ?? {}, resources)
        }) as unknown as Promise<T[]>;
    }

    public async countForUser(resources: Resources, options?: FindOptions<Attributes<T>>): Promise<number> {
        const where = await this.mergeAccessControlCondition(options?.where ?? {}, resources);

        return this.repository.count({
            ...options,
            where
        });
    }

    protected async mergeAccessControlCondition(where: WhereOptions, resources: Resources): Promise<WhereOptions> {
        if (resources.ids) {
            return {
                [Op.and]: [where, { id: resources.ids }]
            };
        } else if (resources.where) {
            return where ? {
                [Op.and]: [where, resources.where]
            } : resources.where;
        }

        return where;
    }
}

/**
 * @deprecated
 */
export abstract class SequelizeAccessControlRepository<
    T extends SequelizeEntities,
    CreateDto = Partial<T>,
    UpdateDto = Partial<T>
> extends SequelizeRepository<T, CreateDto, UpdateDto> {
    @Inject()
    protected accessControlService!: AccessControlService;

    private readonly accessControlRepository: AccessControlRepository<T>;

    protected constructor(repository: typeof SequelizeEntities<any, any>) {
        super();

        this.accessControlRepository = new AccessControlRepository(repository);
    }

    public async findByPkFromUser(identifier: Identifier, user: Users, options?: FindOptions): Promise<T | null> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return null;
        }
        return this.accessControlRepository.findByPkFromUser(identifier, resources, options);
    }

    public async findOneForUser(user: Users, options?: FindOptions): Promise<T | null> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return null;
        }
        return this.accessControlRepository.findOneForUser(resources, options);
    }

    public async findAllFromUser(user: Users, options?: FindOptions): Promise<T[]> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return [];
        }
        return this.accessControlRepository.findAllFromUser(resources, options);
    }

    public async countForUser(user: Users, options?: FindOptions): Promise<number> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return 0;
        }
        return this.accessControlRepository.countForUser(resources, options);
    }
}

export abstract class SequelizeAccessControlReadRepository<T extends SequelizeEntities> extends SequelizeReadRepository<T> {
    @Inject()
    protected accessControlService!: AccessControlService;

    private readonly accessControlRepository: AccessControlRepository<T>;

    protected constructor(repository: typeof SequelizeEntities<any, any>) {
        super();

        this.accessControlRepository = new AccessControlRepository(repository);
    }

    public async findByPkFromUser(identifier: Identifier, user: Users, options?: FindOptions): Promise<T | null> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return null;
        }
        return this.accessControlRepository.findByPkFromUser(identifier, resources, options);
    }

    public async findOneForUser(user: Users, options?: FindOptions): Promise<T | null> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return null;
        }
        return this.accessControlRepository.findOneForUser(resources, options);
    }

    public async findAllFromUser(user: Users, options?: FindOptions): Promise<T[]> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return [];
        }
        return this.accessControlRepository.findAllFromUser(resources, options);
    }

    public async countForUser(user: Users, options?: FindOptions): Promise<number> {
        const resources = await this.accessControlService.forModel(this.repository).getResources(user);
        if (!resources) {
            return 0;
        }
        return this.accessControlRepository.countForUser(resources, options);
    }
}