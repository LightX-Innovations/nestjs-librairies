export class TypeUtils {
    public static isNullOrUndefined(obj: any): boolean {
        return obj === null || obj === undefined;
    }
    public static isNotNullOrUndefined(obj: any): boolean {
        return obj !== null && obj !== undefined;
    }
}
