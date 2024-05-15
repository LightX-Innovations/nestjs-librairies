import { SetMetadata } from "@nestjs/common";
import { AccessAction, AccessActionType, accessActionTypeValues } from "../models";
import { NEEDS_ACCESS_ACTIONS } from "./constant";

// AccessControl for a handler of a controller. You can either pass the type of access, in which case the parameter name
// for the resource id used will default to ":id". Or you can pass and AccessAction in which you define the type and the
// parameter name for the resource id.
export const NeedsAccessActions = (...accessActions: (AccessActionType | AccessAction)[]) => {
    const accessActionAsObjects: AccessAction[] = [];

    // Convert enums to interface with default values.
    for (const accessAction of accessActions) {
        if ((accessAction as AccessAction)["type"] !== null && (accessAction as AccessAction)["type"] !== undefined) {
            accessActionAsObjects.push(accessAction as AccessAction);
        } else if (accessActionTypeValues.includes(accessAction as AccessActionType)) {
            accessActionAsObjects.push({
                type: accessAction as AccessActionType,
                resourceIdParameterName: "id"
            });
        } else {
            console.log(`Unable to process action provided: ${accessAction}`);
        }
    }

    return SetMetadata(NEEDS_ACCESS_ACTIONS, accessActionAsObjects);
};
