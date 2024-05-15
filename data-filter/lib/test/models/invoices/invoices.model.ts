import { AutoIncrement, Column, CreatedAt, DeletedAt, Model, PrimaryKey, Table, UpdatedAt } from "sequelize-typescript";

@Table({
    tableName: "invoices",
    comment: "invoice"
})
export class Invoices extends Model {
    @AutoIncrement
    @PrimaryKey
    @Column
    id!: number;

    @Column
    invoice_number?: string;

    @Column
    paid?: boolean;

    @Column
    subtotal?: number;

    @Column
    total_cost?: number;

    @CreatedAt
    created_at?: Date;

    @UpdatedAt
    updated_at?: Date;

    @DeletedAt
    deleted_at?: Date;
}
