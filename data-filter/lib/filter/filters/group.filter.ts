import { Op, WhereOptions } from "sequelize";
import { DataFilterUserModel, IRule } from "../..";
import { TranslateAdapter } from "../../adapters/translate.adapter";
import { FilterUtils } from "../filter.utils";
import { GroupFilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { QueryRuleModel } from "../models/query.model";
import { RuleModel } from "../models/rule.model";
import { FilterType } from "../type";
import { BaseFilterDefinition, Filter, FilterDefinition } from "./filter";

export interface BaseGroupFilterDefinition {
    rootFilter: Filter;
    group?: string;
    valueFilter?: Filter;
    lazyLoading?: boolean;
    getValueFilter?: (rule: QueryRuleModel) => Promise<BaseFilterDefinition>;
}

export interface GroupFilterDefinition extends BaseGroupFilterDefinition, IRule {
    getConfig(key: string, user?: DataFilterUserModel): Promise<GroupFilterBaseConfigurationModel>;
    getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined>;
    getHavingOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined>;
}

export class GroupFilter implements GroupFilterDefinition {
    public readonly _type = "group_filter";
    protected _translateService!: TranslateAdapter;

    public set translateService(translateService: TranslateAdapter) {
        this._translateService = translateService;

        this.rootFilter.translateService = translateService;
        if (this.valueFilter) {
            this.valueFilter.translateService = translateService;
        }
    }

    public type = FilterType.Group;
    public group!: string;
    public rootFilter!: Filter;
    public valueFilter?: Filter;
    public lazyLoading?: boolean;
    public getValueFilter?: (rule: QueryRuleModel) => Promise<FilterDefinition>;

    constructor(definition: BaseGroupFilterDefinition) {
        Object.assign(this, definition);
    }

    public static validate(definition: IRule) {
        return definition["_type"] === "group_filter";
    }

    public async getConfig(key: string, user?: DataFilterUserModel): Promise<GroupFilterBaseConfigurationModel> {
        const config = {
            type: this.type,
            rootFilter: await this.rootFilter.getConfig(key, user),
            lazyLoading: this.lazyLoading ?? false
        } as GroupFilterBaseConfigurationModel;

        if (this.valueFilter) {
            config.valueFilter = await this.valueFilter.getConfig(key, user);
        }
        if (this.group) {
            config.group = {
                key: this.group,
                name: await this._translateService.getTranslation(
                    user?.language ?? "",
                    FilterUtils.getGroupTranslationKey(this.group)
                )
            };
        }
        return config;
    }

    public async getWhereOptions(rule: QueryRuleModel, name?: string): Promise<WhereOptions | undefined> {
        const [root, value] = this.getRules(rule);
        if (!root || !value) {
            return {};
        }

        const rootWhere = await this.rootFilter.getWhereOptions(root as QueryRuleModel);
        const valueFilter = this.valueFilter ?? await this.getValueFilter?.(root as QueryRuleModel);
        if (!valueFilter) {
            return rootWhere;
        }

        const valueWhere = await valueFilter.getWhereOptions(value as QueryRuleModel);
        if (!rootWhere || !valueWhere) {
            return undefined;
        }

        return {
            [Op.and]: [rootWhere, valueWhere]
        };
    }

    public async getHavingOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        const [root, value] = this.getRules(rule);
        if (!root || !value) {
            return {};
        }

        const valueFilter = this.valueFilter ?? await this.getValueFilter?.(root as QueryRuleModel);
        const rootHaving = await this.rootFilter.getHavingOptions(rule);
        const valueHaving = await valueFilter?.getHavingOptions(rule);
        if (!rootHaving || !valueHaving) {
            return undefined;
        }

        return {
            [Op.and]: [
                rootHaving,
                valueHaving
            ]
        };
    }

    protected getRules(rule: QueryRuleModel): [RuleModel | null, RuleModel | null] {
        const [root, value] = rule.value as [RuleModel, RuleModel];
        if (!root.value || !value.value || !value.operation) {
            return [null, null];
        }

        return [root, value];
    }
}
