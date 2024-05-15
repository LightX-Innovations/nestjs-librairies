import { FindAttributeOptions } from "sequelize";
import { AttributesHandler } from "../handlers/attributes.handler";
import { DataFilterHandler } from "../handlers/data-filter.handler";

export function Attributes(attributes?: FindAttributeOptions): PropertyDecorator & ClassDecorator {
    return (target: Object, propertyKey?: string | symbol) => {
        defineAttributesMetadata(target, propertyKey, attributes);
    };
}

function defineAttributesMetadata(target: Object, propertyKey: string | symbol | undefined, options?: FindAttributeOptions) {
    if (!propertyKey) {
        const dataFilter = DataFilterHandler.getDataFilter(target);
        dataFilter.setAttributes(options);
        DataFilterHandler.saveDataFilter(target, dataFilter);
        return;
    }

    const attribute = AttributesHandler.getAttribute(target, propertyKey);
    attribute.setAttributes(options);
    AttributesHandler.saveAttribute(target, attribute);
}
