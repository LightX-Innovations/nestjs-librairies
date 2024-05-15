import { AttributesHandler } from "../handlers/attributes.handler";
import { DataFilterHandler } from "../handlers/data-filter.handler";

export function IgnoreInSearch(): PropertyDecorator & ClassDecorator {
    return (target: Object, propertyKey?: string | symbol) => {
        defineInSearchMetadata(target, propertyKey);
    }
}

function defineInSearchMetadata(target: Object, propertyKey: string | symbol | undefined) {
    if (!propertyKey) {
        const dataFilter = DataFilterHandler.getDataFilter(target);
        dataFilter.setIgnoreInPath(true);
        DataFilterHandler.saveDataFilter(target, dataFilter);
        return;
    }

    const attribute = AttributesHandler.getAttribute(target, propertyKey);
    attribute.setIgnoreInPath(true);
    AttributesHandler.saveAttribute(target, attribute);
}
