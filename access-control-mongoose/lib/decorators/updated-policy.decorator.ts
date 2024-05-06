import { UpdatedPolicy } from "@lightx-innovations/nestjs-access-control";

export const MongooseUpdatedPolicy = (model: any) =>
  UpdatedPolicy(model, { type: "mongoose" });
