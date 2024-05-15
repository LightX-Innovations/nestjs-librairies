export enum AccessActionType {
    Read = "r",
    Update = "u",
    Delete = "d"
}

export type AccessAction = {
    type: AccessActionType;
    resourceIdParameterName: string;
};

export const accessActionTypeValues = Object.values(AccessActionType);

export interface PermissionsOption {
    r: string;
    u: string;
    d: string;
}
const defaultPermissionsOption = { r: "read", u: "update", d: "delete" };

export class AccessRules {
    public r!: boolean;
    public u!: boolean;
    public d!: boolean;

    public get hasNoAccess(): boolean {
        return !this.r && !this.u && !this.d;
    }

    constructor(value: Partial<AccessRules>) {
        Object.assign(this, value);
    }

    public static all(): AccessRules {
        return new AccessRules({
            [AccessActionType.Read]: true,
            [AccessActionType.Update]: true,
            [AccessActionType.Delete]: true
        });
    }

    public static readOnly(): AccessRules {
        return new AccessRules({
            [AccessActionType.Read]: true,
            [AccessActionType.Update]: false,
            [AccessActionType.Delete]: false
        });
    }

    public static none(): AccessRules {
        return new AccessRules({
            [AccessActionType.Read]: false,
            [AccessActionType.Update]: false,
            [AccessActionType.Delete]: false
        });
    }

    public static rud(r: boolean, u: boolean, d: boolean): AccessRules {
        return new AccessRules({
            [AccessActionType.Read]: r,
            [AccessActionType.Update]: u,
            [AccessActionType.Delete]: d
        });
    }

    public static fromString(rule: string): AccessRules {
        return new AccessRules(JSON.parse(rule));
    }

    public static fromPermissions(permissions: string[], options?: PermissionsOption): AccessRules;
    public static fromPermissions(permissions: string[], suffix?: string, options?: PermissionsOption): AccessRules;
    public static fromPermissions(
        permissions: string[],
        suffixOrOptions?: string | PermissionsOption,
        options?: PermissionsOption
    ): AccessRules {
        const opt = options
            ? options
            : typeof suffixOrOptions === "string"
            ? defaultPermissionsOption
            : suffixOrOptions ?? defaultPermissionsOption;
        const suffix = typeof suffixOrOptions === "string" ? `-${suffixOrOptions}` : "";
        return new AccessRules({
            [AccessActionType.Read]: permissions.some((x) => x === opt.r + suffix),
            [AccessActionType.Update]: permissions.some((x) => x === opt.u + suffix),
            [AccessActionType.Delete]: permissions.some((x) => x === opt.d + suffix)
        });
    }

    public has(accessActionType: AccessActionType): boolean {
        return this[accessActionType];
    }
}
