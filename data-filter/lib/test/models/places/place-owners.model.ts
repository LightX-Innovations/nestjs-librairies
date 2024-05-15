import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DeletedAt,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import { Owners } from "./owners.model";
import { Places } from "./places.model";

@Table({
    tableName: "place_owners"
})
export class PlaceOwners extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    @ForeignKey(() => Places)
    place_id?: number;

    @Column
    @ForeignKey(() => Owners)
    owner_id?: number;

    @BelongsTo(() => Owners)
    owner?: Owners;

    @BelongsTo(() => Places)
    place?: Places;

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
