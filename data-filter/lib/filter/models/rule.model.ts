import { FilterOperators } from "../operators";

export interface RuleModel {
    operation: FilterOperators;
    value: unknown | unknown[];
}

export interface IRule {
    _type: string;
}
