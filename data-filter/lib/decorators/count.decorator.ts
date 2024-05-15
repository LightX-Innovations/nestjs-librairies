import { AttributesHandler } from "../handlers/attributes.handler";
import { DataFilterHandler } from "../handlers/data-filter.handler";
import { CountAttributesConfig, CountConfig } from "../models/count.model";

export function Count(name: string, options: Omit<CountConfig, "name">): PropertyDecorator & ClassDecorator {
    return (target: Object, propertyKey?: string | symbol) => {
        defineCustomAttributesMetadata(target, propertyKey, name, {
            ...options,
            name
        });
    };
}

function defineCustomAttributesMetadata(target: Object, propertyKey: string | symbol | undefined, name: string, options: CountConfig) {
    if (!propertyKey) {
        const dataFilter = DataFilterHandler.getDataFilter(target);
        dataFilter.addCustomAttribute(new CountAttributesConfig(name, options));
        DataFilterHandler.saveDataFilter(target, dataFilter);
        return;
    }

    const attribute = AttributesHandler.getAttribute(target, propertyKey);
    attribute.addCustomAttribute(new CountAttributesConfig(name, options));
    AttributesHandler.saveAttribute(target, attribute);
}
