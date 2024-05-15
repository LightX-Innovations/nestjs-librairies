import {
    AutoIncrement, BelongsTo,
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
import { Places } from "../places/places.model";
import { ContractSystems } from "../contracts/contract-systems.model";

@Table({
    tableName: "systems",
    comment: "system"
})
export class Systems extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    @ForeignKey(() => Places)
    place_id?: number;

    @Column
    latitude?: number;

    @Column
    longitude?: number;

    @Column
    file_number?: string;

    @BelongsTo(() => Places)
    place?: Places;

    @HasMany(() => ContractSystems)
    contracts?: ContractSystems[];

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
