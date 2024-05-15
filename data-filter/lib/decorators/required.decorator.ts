import { AttributesHandler } from "../handlers/attributes.handler";
import { PathConfig } from "../models/path.model";

export function Required(required = true): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const attribute = AttributesHandler.getAttribute(target, propertyKey);
        const path = attribute.path ?? new PathConfig();
        path.required = required;
        attribute.setPath(path);
        AttributesHandler.saveAttribute(target, attribute);
    };
}
