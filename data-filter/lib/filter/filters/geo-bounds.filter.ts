import { fn, literal, where, WhereOptions } from "sequelize";
import { SequelizeUtils } from "../../sequelize.utils";
import { QueryRuleModel } from "../models";
import { FilterOperatorTypes, SelectOperators } from "../operators";
import { FilterType } from "../type";
import { BaseFilterDefinition, Filter } from "./filter";

export interface GeoBoundsFilterDefinitionWithPoint {
    attribute: string;
}

export interface GeoBoundsFilterDefinitionWithLatLng {
    latAttribute: string;
    lngAttribute: string;
}

export interface BaseGeoBoundsFilterDefinition  extends Omit<BaseFilterDefinition, "attribute"> {
    srid?: number;
}

export type GeoBoundsFilterDefinition = BaseGeoBoundsFilterDefinition & (GeoBoundsFilterDefinitionWithPoint | GeoBoundsFilterDefinitionWithLatLng);

export class GeoBoundsFilter extends Filter implements BaseGeoBoundsFilterDefinition, GeoBoundsFilterDefinitionWithPoint, GeoBoundsFilterDefinitionWithLatLng  {
    public type = FilterType.GeoBounds;
    public operators = [...SelectOperators];
    public latAttribute!: string;
    public lngAttribute!: string;
    public srid?: number;

    constructor(definition: GeoBoundsFilterDefinition) {
        super(definition as BaseFilterDefinition);
    }

    public async getWhereOptions(rule: QueryRuleModel): Promise<WhereOptions> {
        const points = rule.value as [number, number][];
        points.push(points[0]);
        const formattedPoints = points.map(([latitude, longitude]) => `${latitude} ${longitude}`).join(", ");
        const polygon = fn("ST_GeometryFromText", literal(`'POLYGON((${formattedPoints}))'`), this.srid ?? 0);
        const point = this.attribute ??
            fn(
                "Point",
                this.path ? literal(SequelizeUtils.getLiteralFullName(this.lngAttribute, this.path)) : this.lngAttribute,
                this.path ? literal(SequelizeUtils.getLiteralFullName(this.latAttribute, this.path)) : this.latAttribute
            );
        return where(
            fn("ST_Contains", polygon, this.srid ? fn("ST_SRID", point, this.srid) : point),
            literal(`${rule.operation === FilterOperatorTypes.Equal ? 1 : 0}`)
        );
    }
}
