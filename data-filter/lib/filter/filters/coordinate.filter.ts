import { Op, WhereOptions } from "sequelize";
import { SequelizeUtils } from "../../sequelize.utils";
import { QueryRuleModel, RuleModel } from "../models";
import { FilterOperatorTypes, SelectOperators } from "../operators";
import { FilterType } from "../type";
import { BaseFilterDefinition, Filter } from "./filter";

export class CoordinateFilter extends Filter {
    public type = FilterType.Coordinate;
    public operators = [...SelectOperators];

    constructor(definition: BaseFilterDefinition) {
        super(definition);
    }

    public async getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        const [latitude, longitude] = CoordinateFilter.getCoordinates(rule);
        switch (rule.operation) {
            case FilterOperatorTypes.Equal:
                return this.getEqualWhereOptions(rule, latitude, longitude);
            case FilterOperatorTypes.NotEqual:
                return this.getNotEqualWhereOptions(rule, latitude, longitude);
        }
    }

    private async getEqualWhereOptions(rule: QueryRuleModel, latitude: number, longitude: number): Promise<WhereOptions | undefined> {
        const first = await super.getWhereOptions({
            operation: FilterOperatorTypes.Equal,
            value: latitude,
            id: rule.id
        }, SequelizeUtils.getAttributeFullName("latitude", [this.path, this.attribute].filter(x => x).join(".")));

        const second = await super.getWhereOptions({
            operation: FilterOperatorTypes.Equal,
            value: longitude,
            id: rule.id
        }, SequelizeUtils.getAttributeFullName("longitude", [this.path, this.attribute].filter(x => x).join(".")));

        if (!first || !second) {
            return;
        }

        return {
            [Op.and]: [
                first,
                second
            ]
        };
    }

    private async getNotEqualWhereOptions(rule: QueryRuleModel, latitude: number, longitude: number): Promise<WhereOptions | undefined> {
        const first = await super.getWhereOptions({
            operation: FilterOperatorTypes.NotEqual,
            value: latitude,
            id: rule.id
        }, SequelizeUtils.getAttributeFullName("latitude", [this.path, this.attribute].filter(x => x).join(".")));

        const second = await super.getWhereOptions({
            operation: FilterOperatorTypes.NotEqual,
            value: longitude,
            id: rule.id
        }, SequelizeUtils.getAttributeFullName("longitude", [this.path, this.attribute].filter(x => x).join(".")));

        if (!first || !second) {
            return;
        }

        return {
            [Op.or]: [
                first,
                second
            ]
        };
    }

    public static getCoordinates(rule: RuleModel): [number, number] {
        const [latitude, longitude] = rule.value as [number, number];
        if (typeof latitude !== "number" && typeof longitude !== "number") {
            return [0, 0];
        }

        return [latitude, longitude];
    }
}
