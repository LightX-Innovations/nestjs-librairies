import { Model, ModelStatic } from "sequelize-typescript";

export const GEO_POINT_SRID = 4326;

export class GeoPoint {
    public type = "Point";

    constructor(public coordinates: number[]) {}
}

export class SequelizeUtils {
    public static formatInstanceDateOnly(instance: any): void {
        if (!instance || typeof instance !== "object") {
            return;
        }

        for (const key in instance.dataValues) {
            if (!instance.dataValues.hasOwnProperty(key)) {
                continue;
            }

            if (key in instance.rawAttributes) {
                const designType = Reflect.getMetadata("design:type", instance, key);
                if (
                    instance.rawAttributes[key].type.key === "DATEONLY" &&
                    designType === Date &&
                    instance.dataValues[key]
                ) {
                    instance.dataValues[key] = new Date(instance.dataValues[key]);
                }
            } else if (Array.isArray(instance.dataValues[key])) {
                instance.dataValues[key].forEach(SequelizeUtils.formatInstanceDateOnly);
            } else if (typeof instance.dataValues[key] === "object") {
                SequelizeUtils.formatInstanceDateOnly(instance.dataValues[key]);
            }
        }
    }

    public static getModelFromInstance(instance: Model<any, any>): ModelStatic<any> | undefined {
        const models = instance.sequelize.models;
        // loop through the instance prototype chain to find the model
        let currentInstance = instance;
        while (currentInstance) {
            const splitted = String(currentInstance).split(":");
            if (splitted.length !== 0) {
                const lastElement = splitted[splitted.length - 1];
                const splittedLastElement = lastElement.split("]");
                if (splittedLastElement.length !== 0) {
                    const modelName = splittedLastElement[0];
                    if (modelName in models) {
                        return models[modelName];
                    }
                }
            }
            currentInstance = Object.getPrototypeOf(currentInstance);
        }
    }
}
