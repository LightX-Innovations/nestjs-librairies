import { ProjectionAlias } from "sequelize";
import { IncludeWhereModel } from "./include.model";
import { PathModel } from "./path.model";

export interface CustomAttributesOptionConfig {
    name: string;
    path?: string;
    where?: IncludeWhereModel;
}

export interface CustomAttributesConfig<T extends CustomAttributesOptionConfig = CustomAttributesOptionConfig> {
    key: string;
    type: string;
    config?: T;

    transform(options?: object, path?: string): string | ProjectionAlias | null;
    shouldGroupBy(): boolean;
}

export interface CustomAttributesModel {
    key: string;
    attribute: string | ProjectionAlias;
    path?: PathModel;
}
