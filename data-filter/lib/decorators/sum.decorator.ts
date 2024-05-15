import { AttributesHandler } from "../handlers/attributes.handler";
import { DataFilterHandler } from "../handlers/data-filter.handler";
import { SumAttributesConfig, SumConfig } from "../models/sum.model";

export function Sum(name: string, options: Omit<SumConfig, "name">): PropertyDecorator & ClassDecorator {
    return (target: Object, propertyKey?: string | symbol) => {
        defineCustomAttributesMetadata(target, propertyKey, name, {
            ...options,
            name
        });
    };
}

function defineCustomAttributesMetadata(target: Object, propertyKey: string | symbol | undefined, name: string, options: SumConfig) {
    if (!propertyKey) {
        const dataFilter = DataFilterHandler.getDataFilter(target);
        dataFilter.addCustomAttribute(new SumAttributesConfig(name, options));
        DataFilterHandler.saveDataFilter(target, dataFilter);
        return;
    }

    const attribute = AttributesHandler.getAttribute(target, propertyKey);
    attribute.addCustomAttribute(new SumAttributesConfig(name, options));
    AttributesHandler.saveAttribute(target, attribute);
}
