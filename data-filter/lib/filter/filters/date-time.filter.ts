import { format, parseJSON } from "date-fns";
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

    public async getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions> {
        if (rule.operation === FilterOperatorTypes.Between || rule.operation === FilterOperatorTypes.NotBetween) {
            return super.getWhereOptions({
                ...rule,
                value: [
                    format(parseJSON(rule.value[0]), "yyyy-MM-dd HH:mm:ss"),
                    format(parseJSON(rule.value[1]), "yyyy-MM-dd HH:mm:ss")
                ]
            });
        }

        return super.getWhereOptions({
            operation: rule.operation,
            value: format(parseJSON(rule.value as any), "yyyy-MM-dd HH:mm:ss"),
            id: rule.id
        });
    }
}
