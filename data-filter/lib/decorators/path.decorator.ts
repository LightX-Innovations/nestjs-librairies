import { IncludeWhereModel } from "../models/include.model";
import { AttributesHandler } from "../handlers/attributes.handler";
import { PathConfig } from "../models/path.model";

export function Path(path: string, where?: IncludeWhereModel, required?: boolean): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const attribute = AttributesHandler.getAttribute(target, propertyKey);
        const config = new PathConfig({
            path,
            paranoid: true
        });
        if (where) {
            config.where = where;
        }
        if (required !== undefined) {
            config.required = required;
        }

        attribute.setPath(config);
        AttributesHandler.saveAttribute(target, attribute);
    };
}
