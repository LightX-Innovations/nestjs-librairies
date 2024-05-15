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
import { Coords } from "../coords/coords.model";

@Table({
    tableName: "persons",
    comment: "person"
})
export class Persons extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    user_id?: string;

    @Column
    @ForeignKey(() => Coords)
    coord_id?: number;

    @Column
    email?: string;

    @Column
    first_name?: string;

    @Column
    last_name?: string;

    @BelongsTo(() => Coords)
    coord?: Coords;

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
