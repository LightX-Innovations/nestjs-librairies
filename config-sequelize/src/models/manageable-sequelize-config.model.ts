import { Transaction } from "sequelize";

export type SequelizeConfigUpdate<T extends ManageableSequelizeConfig<T>> = Partial<Omit<T, "reload" | "update">>;

export type ReloadSequelizeConfigOptions = {
    transaction?: Transaction;
};

export type UpdateSequelizeConfigOptions = {
    transaction?: Transaction;
};

export abstract class ManageableSequelizeConfig<T extends ManageableSequelizeConfig<T>> {
    reload!: (options?: ReloadSequelizeConfigOptions) => Promise<void>;
    update!: (update: SequelizeConfigUpdate<T>, options?: UpdateSequelizeConfigOptions) => Promise<void>;
}
