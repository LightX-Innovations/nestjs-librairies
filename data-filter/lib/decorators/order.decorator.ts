import { Order } from "sequelize";
import { AttributesHandler } from "../handlers/attributes.handler";

export function Order(order: Order): PropertyDecorator {
    return (target: Object, propertyKey: string | symbol) => {
        const attribute = AttributesHandler.getAttribute(target, propertyKey);
        attribute.setOrder(order);
        AttributesHandler.saveAttribute(target, attribute);
    };
}
