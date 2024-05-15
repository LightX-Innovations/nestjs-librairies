import { format, parseISO } from "date-fns";
import { WhereOptions } from "sequelize";
import { QueryRuleModel } from "../models";
import { DateOperators, FilterOperatorTypes } from "../operators";
import { FilterType } from "../type";
import { BaseFilterDefinition, Filter } from "./filter";

// Filters a row by exact date and time given in the rules.
export class DateTimeFilter extends Filter {
    public type = FilterType.DateTime;
    public operators = [...DateOperators];

    constructor(definition: BaseFilterDefinition) {
        super(definition);
    }

    public async getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        if (rule.operation === FilterOperatorTypes.Between || rule.operation === FilterOperatorTypes.NotBetween) {
            if (!Array.isArray(rule.value)) {
                return undefined;
            }

            return super.getWhereOptions({
                ...rule,
                value: [
                    format(parseISO(rule.value[0]), "yyyy-MM-dd HH:mm:ss"),
                    format(parseISO(rule.value[1]), "yyyy-MM-dd HH:mm:ss")
                ]
            });
        }

        return super.getWhereOptions({
            operation: rule.operation,
            value: format(parseISO(rule.value as any), "yyyy-MM-dd HH:mm:ss"),
            id: rule.id
        });
    }
}
