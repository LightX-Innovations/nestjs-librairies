import {
    AutoIncrement,
    BelongsTo,
    BelongsToMany,
    Column,
    CreatedAt,
    DeletedAt,
    ForeignKey,
    HasMany,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import { Owners } from "./owners.model";
import { PlaceOwners } from "./place-owners.model";
import { Coords } from "../coords/coords.model";
import { Systems } from "../systems/systems.model";

@Table({
    tableName: "places",
    comment: "place"
})
export class Places extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    @ForeignKey(() => Coords)
    billing_coord_id?: number;

    @Column
    @ForeignKey(() => Coords)
    geo_coord_id?: number;

    @BelongsTo(() => Coords, "billing_coord_id")
    billingCoord?: Coords;

    @BelongsTo(() => Coords, "geo_coord_id")
    geoCoord?: Coords;

    @HasMany(() => Systems)
    systems?: Systems[];

    @BelongsToMany(() => Owners, () => PlaceOwners)
    owners?: Owners[];

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
