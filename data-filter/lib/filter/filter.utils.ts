import { Type } from "@nestjs/common";
import { BaseFilter } from "./base-filter";

export class FilterUtils {
    public static getProviderToken(filter: Type<BaseFilter<any>>): string {
        return `${filter.name}Service`;
    }

    public static getFilterTranslationKey(key: string): string {
        return `filter.${key}.name`;
    }

    public static getGroupTranslationKey(group: string): string {
        return `data_filter.filter.groups.${group}`;
    }

    public static getOperatorTranslationKey(operator: string): string {
        return `data_filter.filter.operators.${operator}`;
    }

    public static getCustomOperatorTranslationKey(key: string, operator: string): string {
        return `filter.${key}.operators.${operator}`;
    }

    public static getRadioOptionTranslationKey(key: string, option: string): string {
        return `filter.${key}.options.${option}`;
    }
}
