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
import { ContractSystems } from "../contracts/contract-systems.model";
import { Visits } from "../visits/visits.model";

@Table({
    tableName: "maintenance_visits",
    comment: "maintenance-visit"
})
export class MaintenanceVisits extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    @ForeignKey(() => Visits)
    visit_id?: number;

    @Column
    @ForeignKey(() => ContractSystems)
    contract_system_id?: number;

    @BelongsTo(() => Visits)
    visit?: Visits;

    @BelongsTo(() => ContractSystems)
    contractSystem?: ContractSystems;

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
