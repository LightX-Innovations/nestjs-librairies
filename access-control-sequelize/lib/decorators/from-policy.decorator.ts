import { FromPolicy } from "@lightx-innovations/nestjs-access-control";

export const SequelizeFromPolicy = (model: any) => FromPolicy(model, { type: "sequelize" });
