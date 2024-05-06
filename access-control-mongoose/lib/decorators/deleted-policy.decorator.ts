import { DeletedPolicy } from "@lightx-innovations/nestjs-access-control";

export const MongooseDeletedPolicy = (model: any) =>
  DeletedPolicy(model, { type: "mongoose" });
