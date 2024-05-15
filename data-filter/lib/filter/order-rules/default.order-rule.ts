import { IRule } from "../models";

export interface DefaultOrderRuleDefinition {
    column: string;
    direction: "asc" | "desc" | "";
    nullLast?: boolean;
}

export class DefaultOrderRule implements IRule {
    public readonly _type = "default_order_rule";

    constructor(public order: DefaultOrderRuleDefinition | DefaultOrderRuleDefinition[]) {}

    public static validate(definition: IRule): boolean {
        return definition["_type"] === "default_order_rule";
    }
}
