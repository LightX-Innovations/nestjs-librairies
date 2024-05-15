import { Order, WhereOptions } from "sequelize";
import { SequelizeUtils } from "../sequelize.utils";
import { IncludeWhereModel } from "./include.model";

export interface PathModel {
    path: string;
    where?: WhereOptions;
    required?: boolean;
    separate?: boolean;
    paranoid?: boolean;
    subQuery?: boolean;
    order?: Order;
    limit?: number;
}

export class PathConfig {
    path!: string;
    where?: IncludeWhereModel;
    required?: boolean;
    separate?: boolean;
    paranoid?: boolean;
    subQuery?: boolean;
    order?: Order;
    limit?: number;

    constructor(values?: Partial<PathConfig>) {
        Object.assign(this, values ?? {});
    }

    public transformPathConfig(options?: object): PathModel {
        if (!options) {
            const { where, ...path } = this;
            return path;
        }

        if (this.where) {
            return {
                ...this,
                where: SequelizeUtils.generateWhereConditions(this.where, options)
            };
        }

        return { ...this } as PathModel;
    }
}
