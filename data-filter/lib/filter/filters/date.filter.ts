import { addMilliseconds, endOfDay, parseISO, startOfDay } from "date-fns";
import { getTimezoneOffset } from "date-fns-tz";
import { Op, WhereOptions } from "sequelize";
import { QueryRuleModel } from "../models";
import { DateOperators, FilterOperatorTypes } from "../operators";
import { FilterType } from "../type";
import { BaseFilterDefinition, Filter } from "./filter";

export interface DateFilterDefinition {
    skipTimezone?: boolean;
    defaultTimezone?: string;
}

// Filters a row by exact date given in the rules. We strip the time from the date.
//
// Depending on the inclusivity of your request we use the start of day or end of day, for example if the rule's value
// is "2020-03-06T00:55:12";
//  - And its operator is LessOrEqual we will output "< 2020-03-06T00:00:00" to exclude the given day.
//  - And its operator is Less, we will output "< 2020-03-06T23:59:59" to include the given day.
//
// For Between and NotBetween operators, we always include the given first day and last day, so make sure to shrink your
// timeframe by one day for each side you don't want to include.
export class DateFilter extends Filter implements DateFilterDefinition {
    public type = FilterType.Date;
    public operators = [...DateOperators];

    public readonly defaultTimezone: string;
    public readonly skipTimezone!: boolean;

    constructor(definition: BaseFilterDefinition & DateFilterDefinition) {
        super(definition);

        this.defaultTimezone = definition.defaultTimezone ?? "America/Montreal";
    }

    public async getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        if (rule.operation === FilterOperatorTypes.IsNull || rule.operation === FilterOperatorTypes.IsNotNull) {
            return super.getWhereOptions(rule);
        }

        // TODO: Check if the client sends us a timezone
        const offsetMilliseconds = getTimezoneOffset(this.defaultTimezone);

        if (rule.operation === FilterOperatorTypes.Between || rule.operation === FilterOperatorTypes.NotBetween) {
            if (!Array.isArray(rule.value)) {
                return;
            }

            const values = this.skipTimezone
                ? rule.value
                :
                [
                    addMilliseconds(startOfDay(parseISO(rule.value[0])), offsetMilliseconds).toISOString(),
                    addMilliseconds(endOfDay(parseISO(rule.value[1])), offsetMilliseconds).toISOString()
                ];
            return super.getWhereOptions({
                ...rule,
                value: values
            });
        }

        const parsedValue = parseISO(rule.value as any);
        const start = this.skipTimezone ? startOfDay(parsedValue).toISOString() : addMilliseconds(startOfDay(parsedValue), offsetMilliseconds).toISOString();
        const end = this.skipTimezone ? endOfDay(parsedValue).toISOString() : addMilliseconds(endOfDay(parsedValue), offsetMilliseconds).toISOString();

        switch (rule.operation) {
            case FilterOperatorTypes.Equal:
                return this.getEqualWhereOptions(rule, start, end);
            case FilterOperatorTypes.NotEqual:
                return this.getNotEqualWhereOptions(rule, start, end);
            case FilterOperatorTypes.Less:
                return this.getLessWhereOptions(rule, start);
            case FilterOperatorTypes.LessOrEqual:
                return this.getLessOrEqualWhereOptions(rule, end);
            case FilterOperatorTypes.Greater:
                return this.getGreaterWhereOptions(rule, end);
            case FilterOperatorTypes.GreaterOrEqual:
                return this.getGreaterOrEqualWhereOptions(rule, start);
            default:
                return super.getWhereOptions(rule);
        }
    }

    private async getEqualWhereOptions(rule: QueryRuleModel, start: string, end: string): Promise<WhereOptions | undefined> {
        return super.getWhereOptions({
            operation: FilterOperatorTypes.Between,
            value: [start, end],
            id: rule.id
        });
    }

    private async getNotEqualWhereOptions(rule: QueryRuleModel, start: string, end: string): Promise<WhereOptions | undefined> {
        const first = await super.getWhereOptions({
            operation: FilterOperatorTypes.Less,
            value: start,
            id: rule.id
        });
        const second = await super.getWhereOptions({
            operation: FilterOperatorTypes.Greater,
            value: end,
            id: rule.id
        });
        if (!first || !second) {
            return;
        }

        return {
            [Op.or]: [first, second]
        };
    }

    private async getLessWhereOptions(rule: QueryRuleModel, start: string): Promise<WhereOptions | undefined> {
        return super.getWhereOptions({
            operation: FilterOperatorTypes.Less,
            value: start,
            id: rule.id
        });
    }

    private async getLessOrEqualWhereOptions(rule: QueryRuleModel, end: string): Promise<WhereOptions | undefined> {
        return super.getWhereOptions({
            operation: FilterOperatorTypes.LessOrEqual,
            value: end,
            id: rule.id
        });
    }

    private async getGreaterWhereOptions(rule: QueryRuleModel, end: string): Promise<WhereOptions | undefined> {
        return super.getWhereOptions({
            operation: FilterOperatorTypes.Greater,
            value: end,
            id: rule.id
        });
    }

    private async getGreaterOrEqualWhereOptions(rule: QueryRuleModel, start: string): Promise<WhereOptions | undefined> {
        return super.getWhereOptions({
            operation: FilterOperatorTypes.GreaterOrEqual,
            value: start,
            id: rule.id
        });
    }
}
