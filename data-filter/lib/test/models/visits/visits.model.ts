import {
    AutoIncrement,
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    HasOne,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import { MaintenanceVisits } from "../maintenance-visits/maintenance-visits.model";

@Table({
    tableName: "visits",
    comment: "visit"
})
export class Visits extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    type?: string;

    @Column(DataType.DATEONLY)
    visit_date?: string;

    @Column(DataType.TIME)
    visit_time?: string;

    @HasOne(() => MaintenanceVisits)
    maintenanceVisit?: MaintenanceVisits;

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
