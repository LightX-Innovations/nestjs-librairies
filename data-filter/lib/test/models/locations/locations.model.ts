import {
    AutoIncrement,
    Column,
    CreatedAt,
    DeletedAt,
    HasMany,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import { Coords } from "../coords/coords.model";

@Table({
    tableName: "locations",
    comment: "location"
})
export class Locations extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    value?: string;

    @Column
    unique_code?: string;

    @HasMany(() => Coords)
    coords?: Coords[];

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
