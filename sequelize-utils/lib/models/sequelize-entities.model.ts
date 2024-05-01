import { CreationOptional, DataTypes } from "sequelize";
import { AutoIncrement, Column, CreatedAt, DeletedAt, Model, PrimaryKey, UpdatedAt } from "sequelize-typescript";

export interface SequelizeEntitiesAttributes {
    id: number;
    createdAt?: Date;
    updatedAt?: Date;
    deletedAt?: Date;
}

export class SequelizeEntities<
    TModelAttributes extends {} = any,
    TCreationAttributes extends {} = TModelAttributes
> extends Model<TModelAttributes, TCreationAttributes> {
    @AutoIncrement
    @PrimaryKey
    @Column(DataTypes.INTEGER)
    id!: CreationOptional<number>;

    @CreatedAt
    @Column({ field: "created_at" })
    createdAt?: Date;

    @UpdatedAt
    @Column({ field: "updated_at" })
    updatedAt?: Date;

    @DeletedAt
    @Column({ field: "deleted_at" })
    deletedAt?: Date;
}

/**
 * @deprecated: Use SequelizeEntities instead
 */
export class DatabaseEntities extends SequelizeEntities {}
