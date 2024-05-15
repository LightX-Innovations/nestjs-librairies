import { AllowNull, AutoIncrement, Column, ForeignKey, Model, PrimaryKey, Table } from "sequelize-typescript";
import { Accounts } from "./accounts";
import { Devices } from "./devices";

@Table
export class AccountDevices extends Model {
    @PrimaryKey
    @AutoIncrement
    @Column
    id!: number;

    @AllowNull(false)
    @Column
    @ForeignKey(() => Accounts)
    accountId?: number;

    @AllowNull(false)
    @Column
    @ForeignKey(() => Devices)
    deviceId?: number;
}
