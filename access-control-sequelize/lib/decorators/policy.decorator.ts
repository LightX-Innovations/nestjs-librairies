import { Policy } from "@lightx-innovations/nestjs-access-control";
import { Model } from "sequelize-typescript";

export const SequelizePolicy = (model: typeof Model) => Policy(model, { type: "sequelize" });
