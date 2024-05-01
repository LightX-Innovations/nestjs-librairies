import { Model } from "sequelize";

export type AssociationsPropertiesOf<T extends Model> = Exclude<
    {
        [P in keyof T]-?: NonNullable<T[P]> extends Model<any, any>
        ? P
        : NonNullable<T[P]> extends Array<infer U>
            ? U extends Model<any, any>
                ? P
                : never
            : never;
    }[keyof T],
    keyof Model<any> | "version"
>;
