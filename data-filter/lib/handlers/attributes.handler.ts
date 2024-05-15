import { AttributesConfig } from "../models/attributes.model";
import { ATTRIBUTES } from "../constant";

export class AttributesHandler {
    public static getAttribute(target: Object, propertyKey: string | symbol): AttributesConfig {
        const attributes: AttributesConfig[] = Reflect.getMetadata(ATTRIBUTES, target) || [];
        const attribute = attributes.find(x => x.key === propertyKey);
        if (!attribute) {
            return new AttributesConfig(propertyKey);
        }
        return attribute;
    }

    public static saveAttribute(target: Object, config: AttributesConfig): void {
        const attributes: AttributesConfig[] = Reflect.getMetadata(ATTRIBUTES, target) || [];
        const attribute = attributes.find(x => x.key === config.key);
        if (attribute) {
            return;
        }

        attributes.push(config);
        Reflect.defineMetadata(ATTRIBUTES, attributes, target);
    }
}
