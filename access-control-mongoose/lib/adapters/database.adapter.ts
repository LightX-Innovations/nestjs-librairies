import { DatabaseAdapter, IDatabaseAdapter, ResourceId } from "@lightx-innovations/nestjs-access-control";
import { InjectConnection } from "@nestjs/mongoose";
import { Connection, Model } from "mongoose";

@DatabaseAdapter({ type: "mongoose" })
export class MongooseDatabaseAdapter implements IDatabaseAdapter {
    constructor(@InjectConnection() private connection: Connection) {}

    public getModels(): any[] {
        return Object.values(this.connection.models);
    }

    public getResourceName(model: Model<any>): string {
        const m = this.connection.models[model.name];
        if (!m) {
            throw new Error(`Mongoose model '${model}' not found`);
        }
        return `${m.collection.name}-mongoose`;
    }

    public parseIds(model: Model<any>, ids: string | string[]): ResourceId | ResourceId[] {
        return ids;
    }

    public checkIfResourceExist(model: Model<any>, resourceId: string, condition: any): Promise<boolean> {
        const m = this.connection.models[model.name];
        if (!m) {
            throw new Error(`Mongoose model '${model}' not found`);
        }
        return m
            .count({
                _id: resourceId,
                ...condition
            })
            .exec()
            .then((x) => !!x);
    }
}
