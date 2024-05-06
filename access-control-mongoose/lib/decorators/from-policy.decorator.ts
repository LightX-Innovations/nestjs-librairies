import { FromPolicy } from "@lightx-innovations/nestjs-access-control";

export const MongooseFromPolicy = (model: any) =>
  FromPolicy(model, { type: "mongoose" });
