import { Op, WhereOptions } from "sequelize";
import { PathModel } from "../../models/path.model";
import { DataFilterUserModel } from "../../models/user.model";
import { FilterUtils } from "../filter.utils";
import { QueryRuleModel } from "../models";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterOperatorTypes } from "../operators";
import { FilterType } from "../type";
import { BaseFilterDefinition, Filter, FilterCondition, FilterConditionRule } from "./filter";

export interface OptionsFilterOption {
    key: string;
    value?: unknown;
    operator?: FilterOperatorTypes;
    condition?: FilterCondition;
}

export type OptionsFilterSelectionMode = "radio" | "select";

export interface OptionsFilterDefinition {
    selectionMode: OptionsFilterSelectionMode;
    options: OptionsFilterOption[];
}

export interface OptionsFilterOptionConfiguration {
    key: string;
    name?: string;
}

export interface OptionsFilterConfigurationModel extends FilterBaseConfigurationModel {
    selectionMode: OptionsFilterSelectionMode;
    options: OptionsFilterOptionConfiguration[];
}

export class OptionsFilter extends Filter implements OptionsFilterDefinition {
    public type = FilterType.Options;
    public operators = [FilterOperatorTypes.Equal];
    public selectionMode!: OptionsFilterSelectionMode;
    public options!: OptionsFilterOption[];

    constructor(definition: BaseFilterDefinition & OptionsFilterDefinition) {
        super(definition);
    }

    public async getConfig<Request>(key: string, request: Request, user?: DataFilterUserModel): Promise<OptionsFilterConfigurationModel | null> {
        const config = await super.getConfig(key, request, user);

        if (!config) {
            return null;
        }

        return {
            ...config,
            selectionMode: this.selectionMode,
            options: await Promise.all(this.options.map(async x => ({
                key: x.key,
                name: await this._translateService.getTranslation(
                    user?.language ?? "",
                    FilterUtils.getRadioOptionTranslationKey(key, x.key)
                )
            })))
        };
    }

    public getIncludePaths(rule: QueryRuleModel, data?: object): PathModel[] {
        const option = this.options.find(x => x.key === rule.value);
        const condition = option?.condition;
        if (!condition) {
            return super.getIncludePaths(rule);
        }

        return this.getRulePaths(condition.rules, data);
    }

    public async getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        const option = this.options.find(x => x.key === rule.value);
        if (!option) {
            return super.getWhereOptions(rule);
        }

        if (!option.condition) {
            return super.getWhereOptions({
                ...rule,
                value: option.value,
                operation: option.operator || rule.operation
            });
        }

        const conditions: any[] = [];
        const where = option.condition.condition === "and" ? { [Op.and]: conditions } : { [Op.or]: conditions };
        this.generateRuleWhereOptions(option.condition, conditions, rule);
        conditions.push(
            await super.getWhereOptions({
                ...rule,
                value: option.value,
                operation: option.operator || rule.operation
            })
        );
        return where;
    }

    public async getHavingOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        const option = this.options.find(x => x.key === rule.value);
        if (!option) {
            return super.getHavingOptions(rule);
        }

        return super.getHavingOptions({
            ...rule,
            value: option.value,
            operation: option.operator ?? rule.operation
        });
    }

    private getRulePaths(rules: (FilterConditionRule | FilterCondition)[], data?: object): PathModel[] {
        const paths: PathModel[] = [];

        for (const rule of rules) {
            if ((rule as FilterCondition).rules) {
                paths.push(...this.getRulePaths((rule as FilterCondition).rules, data));
            } else if ((rule as FilterConditionRule).path) {
                if (paths.every((path) => path.path !== (rule as FilterConditionRule).path)) {
                    const r = rule as FilterConditionRule;
                    if (!r.path) {
                        continue;
                    }

                    paths.push({
                        path: r.path,
                        where: FilterUtils.generateWhereConditions(r.where, data)
                    });
                }
            }
        }

        return paths;
    }
}

/**
 * @deprecated: Use OptionsFilter instead
 */
export class RadioFilter extends OptionsFilter {
    public type = FilterType.Radio;

    constructor(definition: BaseFilterDefinition & Omit<OptionsFilterDefinition, "selectionMode">) {
        super({
            ...definition,
            selectionMode: "radio"
        });
    }
}
