import { CreatedPolicy } from "@lightx-innovations/nestjs-access-control";

export const MongooseCreatedPolicy = (model: any) =>
  CreatedPolicy(model, { type: "mongoose" });
