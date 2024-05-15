import {
    AutoIncrement,
    BelongsTo,
    Column,
    CreatedAt,
    DataType,
    DeletedAt,
    ForeignKey,
    Model,
    PrimaryKey,
    Table,
    UpdatedAt
} from "sequelize-typescript";
import { Invoices } from "../invoices/invoices.model";

@Table({
    tableName: "contracts",
    comment: "contract"
})
export class Contracts extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column(DataType.DATEONLY)
    start_date?: Date;

    @Column(DataType.DATEONLY)
    end_date?: Date;

    @Column
    total_cost?: number;

    @Column(DataType.DATEONLY)
    payable_by?: Date;

    @Column
    @ForeignKey(() => Invoices)
    invoice_id?: number;

    @BelongsTo(() => Invoices)
    invoice?: Invoices;

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
