import { AttributesHandler } from "../handlers/attributes.handler";
import { DataFilterHandler } from "../handlers/data-filter.handler";

export function SearchableAttributes(attributes: string[]): PropertyDecorator & ClassDecorator {
    return (target: Object, propertyKey?: string | symbol) => {
        defineSearchableAttributesMetadata(target, propertyKey, attributes);
    };
}

function defineSearchableAttributesMetadata(target: Object, propertyKey: string | symbol | undefined, attributes: string[]) {
    if (!propertyKey) {
        const dataFilter = DataFilterHandler.getDataFilter(target);
        dataFilter.setSearchableAttributes(attributes);
        DataFilterHandler.saveDataFilter(target, dataFilter);
        return;
    }

    const attribute = AttributesHandler.getAttribute(target, propertyKey);
    attribute.setSearchableAttributes(attributes);
    AttributesHandler.saveAttribute(target, attribute);
}
