import { AttributesHandler } from "../handlers/attributes.handler";
import { PathConfig } from "../models/path.model";

export function Limit(limit: number): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const attribute = AttributesHandler.getAttribute(target, propertyKey);
        const path = attribute.path ?? new PathConfig();
        path.limit = limit;
        attribute.setPath(path);
        AttributesHandler.saveAttribute(target, attribute);
    };
}
