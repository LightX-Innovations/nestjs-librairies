import { fn, literal, ProjectionAlias } from "sequelize";
import { Fn, Literal } from "sequelize/types/utils";
import { SequelizeUtils } from "../sequelize.utils";
import { CustomAttributesConfig, CustomAttributesOptionConfig } from "./custom-attributes.model";

export interface BaseDistanceConfig extends CustomAttributesOptionConfig {
    coordinates: (option?: any) => [number, number];
    srid?: number;
}

export interface DistanceConfigWithPoint {
    attribute: string;
}

export interface DistanceConfigWithLatLng {
    latAttribute: string;
    lngAttribute: string;
}

export type DistanceConfig = BaseDistanceConfig & (DistanceConfigWithPoint | DistanceConfigWithLatLng);

export class DistanceAttributesConfig implements CustomAttributesConfig<DistanceConfig> {
    public readonly key: string;
    public type = "distance";

    constructor(key: string | symbol, public config: DistanceConfig) {
        this.key = typeof key === "string" ? key : key.toString();
    }

    public transform(options: object, path?: string): string | ProjectionAlias | null {
        if (!options) {
            return null;
        }

        const coordinates = this.config.coordinates(options);
        if (!coordinates || coordinates.length < 2) {
            return null;
        }

        const [latitude, longitude] = coordinates;
        if (typeof latitude !== "number" || typeof longitude !== "number") {
            return null;
        }
        if (path || this.config.path) {
            path = [path, this.config.path].filter(x => x).join(".");
        }

        const location = fn("ST_GeometryFromText", literal(`'POINT(${latitude} ${longitude})'`), this.config.srid ?? 0);
        return [fn("ST_Distance_Sphere", this.getPointAttribute(path), location), this.config.name ?? this.key];
    }

    public shouldGroupBy(): boolean {
        return false;
    }

    private getPointAttribute(path?: string): Literal | Fn {
        if ((this.config as DistanceConfigWithPoint).attribute) {
            const att = (this.config as DistanceConfigWithPoint).attribute;
            return literal(path ? SequelizeUtils.getLiteralFullName(att, path) : att);
        }

        const lat = path ? literal(SequelizeUtils.getLiteralFullName((this.config as DistanceConfigWithLatLng).latAttribute, path)) : (this.config as DistanceConfigWithLatLng).latAttribute;
        const lng = path ? literal(SequelizeUtils.getLiteralFullName((this.config as DistanceConfigWithLatLng).lngAttribute, path)) : (this.config as DistanceConfigWithLatLng).lngAttribute;
        const point = fn("Point", lng, lat);
        return this.config.srid ? fn("ST_SRID", point, this.config.srid) : point;
    }
}
