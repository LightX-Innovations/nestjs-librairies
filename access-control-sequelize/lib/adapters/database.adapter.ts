import { DatabaseAdapter, IDatabaseAdapter, ResourceId } from "@lightx-innovations/nestjs-access-control";
import { SequelizeEntities } from "@lightx-innovations/nestjs-sequelize-utils";
import { EntitiesMetadataStorage } from "@nestjs/sequelize/dist/entities-metadata.storage";
import { DEFAULT_CONNECTION_NAME } from "@nestjs/sequelize/dist/sequelize.constants";
import { AbstractDataType } from "sequelize";
import { Model } from "sequelize-typescript";

@DatabaseAdapter({ type: "sequelize" })
export class SequelizeDatabaseAdapter implements IDatabaseAdapter {
    public getModels(): any[] {
        return EntitiesMetadataStorage.getEntitiesByConnection(DEFAULT_CONNECTION_NAME) as any[];
    }

    public getResourceName(model: typeof Model): string {
        return `${model.tableName}-sequelize`;
    }

    public parseIds(model: typeof SequelizeEntities, ids: string | string[]): ResourceId | ResourceId[] {
        const primaryKey = model.getAttributes()[model.primaryKeyAttribute];
        if ((primaryKey.type as AbstractDataType).key !== "INTEGER") {
            return ids;
        }

        if (typeof ids === "string") {
            return +ids;
        }

        return ids.map((id) => +id);
    }

    public checkIfResourceExist(model: typeof SequelizeEntities, resourceId: number, condition: any): Promise<boolean> {
        return model
            .count({
                where: {
                    [model.primaryKeyAttribute]: resourceId,
                    ...condition.where
                }
            })
            .then((x) => !!x);
    }
}
