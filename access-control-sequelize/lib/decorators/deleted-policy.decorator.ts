import { DeletedPolicy } from "@lightx-innovations/nestjs-access-control";
import { Model } from "sequelize-typescript";

export const SequelizeDeletedPolicy = (model: typeof Model) => DeletedPolicy(model, { type: "sequelize" });
