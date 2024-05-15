import {
    AutoIncrement,
    BelongsTo,
    BelongsToMany,
    Column,
    CreatedAt,
    DeletedAt,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import { Places } from "./places.model";
import { PlaceOwners } from "./place-owners.model";
import { Persons } from "../persons/persons.model";

@Table({
    tableName: "owners",
    comment: "owner"
})
export class Owners extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    @ForeignKey(() => Persons)
    person_id?: number;

    @BelongsTo(() => Persons)
    person?: Persons;

    @BelongsToMany(() => Places, () => PlaceOwners)
    places?: Places[];

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
