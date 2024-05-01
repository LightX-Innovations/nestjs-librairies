import { CreationOptional, InferAttributes, InferCreationAttributes } from "sequelize";
import { AllowNull, Column, HasMany, } from "sequelize-typescript";
import { MakePropertiesNullable, SequelizeEntities } from "../../lib";

type Attributes = MakePropertiesNullable<InferAttributes<Accounts>>;
type CreateAttributes = InferCreationAttributes<Accounts> & {
    firstName: string;
    lastName: string;
    email: string;
};

export class Accounts extends SequelizeEntities<Attributes, CreateAttributes> {
    @AllowNull(false)
    @Column
    email?: CreationOptional<string>;

    @AllowNull(false)
    @Column
    firstName?: string;

    @AllowNull(false)
    @Column
    lastName?: string;

    @Column
    phone?: string;

    @HasMany(() => Accounts)
    accounts?: Accounts[];
}
