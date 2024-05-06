import { Policy } from "@lightx-innovations/nestjs-access-control";

export const MongoosePolicy = (model: any) =>
  Policy(model, { type: "mongoose" });
