import { Global, Module, OnModuleInit } from "@nestjs/common";
import { Sequelize } from "sequelize-typescript";
import {
    AfterBulkCreateFormatDateOnlyHook,
    AfterCreateFormatDateOnlyHook
} from "./hooks/after-create-format-date-only.hook";
import { AfterFindFormatDateOnlyHook } from "./hooks/after-find-format-date-only.hook";
import { SequelizeTransactionService } from "./transactions/sequelize-transaction.service";

/** @deprecated: Use SequelizeUtilsModule instead */
@Module({})
export class SequelizeUtilsHooksModule implements OnModuleInit {
    constructor(private sequelize: Sequelize) {}

    public onModuleInit(): void {
       this.sequelize.addHook("afterCreate", "transform-date-only", AfterCreateFormatDateOnlyHook);
       this.sequelize.addHook("afterFind", "transform-date-only", AfterFindFormatDateOnlyHook);
    }
}

@Global()
@Module({
    providers: [SequelizeTransactionService],
    exports: [SequelizeTransactionService]
})
export class SequelizeUtilsModule implements OnModuleInit {
    constructor(private sequelize: Sequelize) {}

    public onModuleInit(): void {
        this.sequelize.addHook("afterBulkCreate", "transform-date-only", AfterBulkCreateFormatDateOnlyHook);
        this.sequelize.addHook("afterCreate", "transform-date-only", AfterCreateFormatDateOnlyHook);
        this.sequelize.addHook("afterFind", "transform-date-only", AfterFindFormatDateOnlyHook);
    }
}
