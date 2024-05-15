import { fn, literal, LogicType, where, WhereOptions } from "sequelize";
import { QueryRuleModel } from "../models";
import { SequelizeUtils } from "../../sequelize.utils";
import { GroupFilter, GroupFilterDefinition } from "./group.filter";
import { CoordinateFilter } from "./coordinate.filter";
import { NumberFilter } from "./number.filter";
import { FilterType } from "../type";

export interface GeoLocalizationFilterDefinition {
    rootFilter: CoordinateFilter;
    group?: string;
    srid?: number;
}

export class GeoLocalizationFilter extends GroupFilter implements GroupFilterDefinition, GeoLocalizationFilterDefinition {
    private static attributesCounter = 0;
    private static whereCounter = 0;

    public type = FilterType.GeoLocalization;
    public rootFilter!: CoordinateFilter;
    public valueFilter = new NumberFilter();
    public srid?: number;

    constructor(definition: GeoLocalizationFilterDefinition) {
        super(definition);
    }

    public async getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions | undefined> {
        const [root, value] = this.getRules(rule);
        if (!root || !value) {
            return;
        }

        const name = this.rootFilter.path ?
            SequelizeUtils.getLiteralFullName(this.rootFilter.attribute, this.rootFilter.path) :
            this.rootFilter.attribute;
        const [latitude, longitude] = CoordinateFilter.getCoordinates(root);
        const location = fn("ST_GeometryFromText", literal(`'POINT(${latitude} ${longitude})'`), this.srid ?? 0);
        return where(fn("ST_Distance_Sphere", literal(name), location), SequelizeUtils.generateWhereValue(value) as LogicType)
    }

    public static reset(): void {
        this.attributesCounter = 0;
        this.whereCounter = 0;
    }
}
