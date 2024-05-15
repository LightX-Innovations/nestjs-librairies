import { IncludeWhereModel } from "../models/include.model";
import { AttributesHandler } from "../handlers/attributes.handler";
import { PathConfig } from "../models/path.model";

export function Where(where: IncludeWhereModel, required = false): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const attribute = AttributesHandler.getAttribute(target, propertyKey);
        const path = attribute.path ?? new PathConfig({
            paranoid: true
        });
        path.where = where;
        path.required = required;
        attribute.setPath(path);
        AttributesHandler.saveAttribute(target, attribute);
    };
}
