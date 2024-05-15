import { SequelizeEntities } from "@lightx-innovations/nestjs-sequelize-utils";
import { AllowNull, BelongsToMany, Column, Table } from "sequelize-typescript";
import { AccountDevices } from "./account-devices";
import { Devices } from "./devices";

@Table
export class Accounts extends SequelizeEntities {
    @AllowNull(false)
    @Column
    userId?: string;

    @AllowNull(false)
    @Column
    name?: string;

    @BelongsToMany(() => Devices, () => AccountDevices)
    devices?: Devices[];
}
