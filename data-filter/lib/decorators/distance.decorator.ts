import { DistanceAttributesConfig, DistanceConfig } from "../models/distance.model";
import { DataFilterHandler } from "../handlers/data-filter.handler";
import { AttributesHandler } from "../handlers/attributes.handler";

export function Distance(options: DistanceConfig): PropertyDecorator & ClassDecorator {
    return (target: Object, propertyKey?: string | symbol) => {
        defineCustomAttributesMetadata(target, propertyKey, options);
    };
}

function defineCustomAttributesMetadata(target: Object, propertyKey: string | symbol | undefined, options: DistanceConfig) {
    if (!propertyKey) {
        const dataFilter = DataFilterHandler.getDataFilter(target);
        dataFilter.addCustomAttribute(new DistanceAttributesConfig(options.name, options));
        DataFilterHandler.saveDataFilter(target, dataFilter);
        return;
    }

    const attribute = AttributesHandler.getAttribute(target, propertyKey);
    attribute.addCustomAttribute(new DistanceAttributesConfig(propertyKey, options));
    AttributesHandler.saveAttribute(target, attribute);
}
