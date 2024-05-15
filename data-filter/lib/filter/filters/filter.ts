import { fn, LogicType, Op, Sequelize, where, WhereOperators, WhereOptions } from "sequelize";
import { TranslateAdapter } from "../../adapters/translate.adapter";
import { IncludeWhereModel } from "../../models/include.model";
import { PathModel } from "../../models/path.model";
import { DataFilterUserModel } from "../../models/user.model";
import { SequelizeUtils } from "../../sequelize.utils";
import { FilterUtils } from "../filter.utils";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { Condition, QueryModel, QueryRuleModel } from "../models/query.model";
import { IRule, RuleModel } from "../models/rule.model";
import { CustomOperator, FilterOperators, FilterOperatorTypes } from "../operators";
import { FilterType } from "../type";

// TODO: Deprecate key to use attribute instead to be consistent with the BaseFilterDefinition
export interface FilterConditionRule {
    key: string;
    path?: string;
    operation: FilterOperators;
    value?: (unknown | unknown[]) | ((value: unknown | unknown[]) => unknown | unknown[]);
    where?: IncludeWhereModel;
}

export interface FilterCondition {
    condition: Condition;
    rules: (FilterConditionRule | FilterCondition)[];
}

export interface JsonConfig {
    type: "array" | "object";
    path?: string;
}

export type PathCondition = boolean | {
    [filter: string]: any;
}

export interface EnabledConfig<User = any, Request = any> {
    user?: User;
    request?: Request
}

export interface BaseFilterDefinition {
    attribute: string;
    path?: string;
    having?: any;
    paranoid?: boolean;
    condition?: FilterCondition;
    group?: string;
    where?: IncludeWhereModel;
    pathCondition?: PathCondition;
    json?: JsonConfig;
    enabled?: ({ user, request }: EnabledConfig) => Promise<boolean>;

    /**
     * Private means that the config will not be returned.
     */
    private?: boolean;
}

export interface FilterDefinition extends BaseFilterDefinition, IRule {
    type: FilterType;
    operators: (FilterOperatorTypes | CustomOperator)[];

    getConfig<Request>(key: string, req: Request, user?: DataFilterUserModel): Promise<FilterBaseConfigurationModel | null>;
    getIncludePaths(rule: QueryRuleModel, data?: object): PathModel[];
    getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined>;
    getHavingOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined>;
    usePathCondition(query: QueryModel): boolean;
}

export abstract class Filter implements FilterDefinition {
    public readonly _type = "filter";

    protected _translateService!: TranslateAdapter;

    public set translateService(translateService: TranslateAdapter) {
        this._translateService = translateService;
    }

    public type!: FilterType;
    public operators!: (FilterOperatorTypes | CustomOperator)[];
    public group!: string;
    public attribute!: string;
    public having?: any;
    public path?: string;
    public condition?: FilterCondition;
    public pathCondition?: PathCondition;
    public json?: JsonConfig;
    public private?: boolean;
    public enabled?: ({ user, request }: EnabledConfig) => Promise<boolean>;
    public paranoid = true;

    public static validate(definition: IRule) {
        return definition["_type"] === "filter";
    }

    protected constructor(definition?: BaseFilterDefinition) {
        if (definition) {
            Object.assign(this, definition);
        }
    }

    public addOperators(...operator: (FilterOperatorTypes | CustomOperator)[]): Filter {
        this.operators.push(...operator);
        return this;
    }

    public removeOperators(...operator: (FilterOperatorTypes | CustomOperator)[]): Filter {
        this.operators = this.operators.filter(x => !operator.some(op => op === x));
        return this;
    }

    public setOperators(...operator: (FilterOperatorTypes | CustomOperator)[]): Filter {
        this.operators = [...operator];
        return this;
    }

    public async getConfig<Request = any>(key: string, request: Request, user?: DataFilterUserModel): Promise<FilterBaseConfigurationModel | null> {
        if (this.private) {
            return null;
        }

        if (this.enabled && !(await this.enabled({ user, request }))) {
            return null;
        }

        const config = {
            type: this.type,
            operators: await Promise.all(this.operators.map(async x => {
                if (typeof x === "string") {
                    return {
                        id: x,
                        name: await this._translateService.getTranslation(
                            user?.language ?? "",
                            FilterUtils.getOperatorTranslationKey(x)
                        )
                    };
                }

                return {
                    id: x.name,
                    name: await this._translateService.getTranslation(
                        user?.language ?? "",
                        FilterUtils.getCustomOperatorTranslationKey(key, x.name)
                    )
                };
            }))
        } as FilterBaseConfigurationModel;

        if (this.group) {
            config.group = {
                key: this.group,
                name: await this._translateService.getTranslation(user?.language ?? "", FilterUtils.getGroupTranslationKey(this.group))
            }
        }
        return config;
    }

    public getIncludePaths(rule: QueryRuleModel, data?: object): PathModel[] {
        return [];
    }

    public async getWhereOptions(rule: QueryRuleModel, name?: string): Promise<WhereOptions | undefined> {
        if (!name) {
            name = this.path ? SequelizeUtils.getAttributeFullName(this.attribute, this.path) : this.attribute;
        }

        const op = this.operators.find(x => {
            if (typeof x === "string") {
                return false;
            }

            return x.name === rule.operation;
        }) as CustomOperator;
        if (op?.operator) {
            rule.operation = op.operator;
        }

        const where = (rule?.value === undefined || this.having) ?
            this.getConditionWhereOptions(undefined, rule) :
            this.getConditionWhereOptions(this.transformCondition(rule, name), rule);

        return this.getOperatorWhereOptions(rule.operation, where, rule.value);
    }

    public async getHavingOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        if (!this.having) {
            return this.getOperatorHavingOptions(rule.operation);
        }

        let options: WhereOptions | undefined = undefined;
        if (this.having.attribute) {
            options = this.having;
        } else {
            const value = SequelizeUtils.generateWhereValue(rule) as WhereOperators;
            if (value !== null || typeof value !== "undefined") {
                options = where(this.having, value);
            }
        }

        return this.getOperatorHavingOptions(rule.operation, options);
    }

    public usePathCondition(query: QueryModel): boolean {
        if (!this.pathCondition || typeof this.pathCondition === "boolean") {
            return false;
        }

        const keys = Object.keys(this.pathCondition);
        const rules = this.getRuleFromKeys(query, keys);
        if (keys.length !== rules.length) {
            return false;
        }

        return rules.every(x => (this.pathCondition as any)[x.id] === x.value);
    }

    protected getConditionWhereOptions(where: WhereOptions | undefined, rule: QueryRuleModel): WhereOptions | undefined {
        if (!this.condition) {
            return where;
        }

        const conditions = where ? [where] : [];
        const option = this.condition.condition === "and" ? { [Op.and]: conditions } : { [Op.or]: conditions };
        this.generateRuleWhereOptions(this.condition, conditions, rule);
        return option;
    }

    protected generateRuleWhereOptions(filter: FilterCondition, options: WhereOptions[], parentRule: QueryRuleModel) {
        for (const rule of filter.rules) {
            const c = rule as FilterCondition;
            if (c.condition) {
                const conditions: any[] = [];
                options.push(c.condition === "and" ? { [Op.and]: conditions } : { [Op.or]: conditions });
                this.generateRuleWhereOptions(c, conditions, parentRule);
                continue;
            }

            let r = rule as FilterConditionRule;
            const name = r.path ? SequelizeUtils.getAttributeFullName(r.key, r.path) : r.key;
            if (typeof r.value === "function") {
                r = {
                    ...r,
                    value: r.value(parentRule.value)
                }
            }
            options.push({
                [name]: SequelizeUtils.generateWhereValue(r as RuleModel)
            });
        }
    }

    protected getOperatorHavingOptions(operator: FilterOperators, where?: WhereOptions): WhereOptions | undefined {
        const op = this.operators.find(x => {
            if (typeof x === "string") {
                return false;
            }

            return x.name === operator;
        }) as CustomOperator;
        if (!op) {
            return where;
        }

        if (!op.having) {
            return where;
        }

        return where
            ? {
                  [Op.and]: [where, op.having]
              }
            : op.having;
    }

    protected getOperatorWhereOptions(operator: FilterOperators, where: WhereOptions | undefined, value: any): WhereOptions | undefined {
        const op = this.operators.find(x => {
            if (typeof x === "string") {
                return false;
            }

            return x.name === operator;
        }) as CustomOperator;
        if (!op) {
            return where;
        }

        if (!op.where && !op.operator) {
            return;
        }

        if (!op.where) {
            return where;
        }

        const opWhere = typeof op.where === "function" ? op.where(value) : op.where;
        return where
            ? {
                  [Op.and]: [where, opWhere]
              }
            : opWhere;
    }

    private getRuleFromKeys(query: QueryModel, keys: string[]): QueryRuleModel[] {
        const rules: QueryRuleModel[] = [];
        for (const rule of query.rules) {
            if ((rule as QueryModel).condition) {
                rules.push(...this.getRuleFromKeys(rule as QueryModel, keys));
            } else if (keys.some(x => (rule as QueryRuleModel).id === x)) {
                rules.push(rule as QueryRuleModel);
            }
        }

        return rules;
    }

    private transformCondition(rule: QueryRuleModel, name: string): WhereOptions | undefined {
        if (!this.json) {
            return {
                [name]: SequelizeUtils.generateWhereValue(rule)
            };
        }

        if (this.json.type === "array") {
            return this.transformForJsonArray(rule);
        }

        return this.transformForJsonObject(rule);
    }

    private transformForJsonArray(rule: QueryRuleModel): WhereOptions | undefined {
        const colName = this.path ? Sequelize.literal(SequelizeUtils.getLiteralFullName(this.attribute, this.path)) : Sequelize.col(this.attribute);
        if (rule.operation === FilterOperatorTypes.Contains || rule.operation === FilterOperatorTypes.NotContains) {
            rule.operation = rule.operation === FilterOperatorTypes.Contains ? FilterOperatorTypes.Equal : FilterOperatorTypes.NotEqual;
        }

        if (rule.operation !== FilterOperatorTypes.Equal && rule.operation !== FilterOperatorTypes.NotEqual) {
            return;
        }

        /**
         * We override the rule to use an equal or not equal with a JSON_CONTAINS function
         */
        const newRule = {
            operation: rule.operation,
            value: true
        }

        const value = typeof rule.value === "string" ? `"${rule.value}"` : rule.value?.toString();
        if (this.json?.path) {
            const col = Sequelize.fn("JSON_EXTRACT", colName, Sequelize.literal(`'$[*].${this.json.path}'`));
            return where(fn("JSON_CONTAINS", col, value), SequelizeUtils.generateWhereValue(newRule as RuleModel) as LogicType)
        }
        return where(fn("JSON_CONTAINS", colName, value), SequelizeUtils.generateWhereValue(newRule as RuleModel) as LogicType)
    }

    private transformForJsonObject(rule: QueryRuleModel): WhereOptions {
        const colName = this.path ? Sequelize.literal(SequelizeUtils.getLiteralFullName(this.attribute, this.path)) : Sequelize.col(this.attribute);
        const value = SequelizeUtils.generateWhereValue(rule);
        if (this.json?.path) {
            return Sequelize.where(Sequelize.fn("JSON_EXTRACT", colName, this.json.path), value as LogicType);
        }

        return Sequelize.where(Sequelize.fn("JSON_EXTRACT", colName), value as LogicType);
    }
}
