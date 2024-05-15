import { IncludeConfig } from "../models/include.model";
import { AttributesHandler } from "../handlers/attributes.handler";

/**
 * @deprecated
 * Should should @Include(path, options?) instead
 */
export function Include(options: IncludeConfig): PropertyDecorator;
export function Include(path: string, separate?: boolean): PropertyDecorator;
export function Include(path: string, IncludeConfig?: Omit<IncludeConfig, "path">): PropertyDecorator;
export function Include(optionsOrPath: IncludeConfig | string, separateOrOptions?: boolean | Omit<IncludeConfig, "path">): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const separate = typeof separateOrOptions === "boolean" ? separateOrOptions : false;
        const options = typeof separateOrOptions === "boolean" ? {} : separateOrOptions;

        // Simplify just passing the path.
        if (typeof optionsOrPath === "string") {
            optionsOrPath = { path: optionsOrPath, separate, paranoid: true, ...options };
        } else {
            if (!optionsOrPath.paranoid) {
                optionsOrPath.paranoid = true;
            }
        }

        const attribute = AttributesHandler.getAttribute(target, propertyKey);
        attribute.addInclude(optionsOrPath);
        AttributesHandler.saveAttribute(target, attribute);
    };
}
