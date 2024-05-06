import {
  ACCESS_CONTROL_RESOURCE,
  AccessControlResourceConfig,
} from "@lightx-innovations/nestjs-access-control";
import { SetMetadata } from "@nestjs/common";

export const MongooseAccessControlResource = (model: any, paramId = "id") => {
  return SetMetadata(ACCESS_CONTROL_RESOURCE, {
    model,
    paramId,
    type: "mongoose",
  } as AccessControlResourceConfig);
};
