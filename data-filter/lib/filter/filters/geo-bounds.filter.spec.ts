import { fn, literal, where, WhereOptions } from "sequelize";
import { DefaultTranslateAdapter } from "../../adapters/default-translate.adapter";
import { FilterUtils } from "../filter.utils";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterOperatorTypes } from "../operators";
import { FilterType } from "../type";
import { GeoBoundsFilter } from "./geo-bounds.filter";

describe("GeoBoundsFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new GeoBoundsFilter({
                latAttribute: "latitude",
                lngAttribute: "longitude"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", {});
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.GeoBounds,
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    },
                    {
                        id: "not_equal",
                        name: FilterUtils.getOperatorTranslationKey("not_equal")
                    }
                ]
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new GeoBoundsFilter({
                latAttribute: "latitude",
                lngAttribute: "longitude",
                group: "test"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", {});
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.GeoBounds,
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    },
                    {
                        id: "not_equal",
                        name: FilterUtils.getOperatorTranslationKey("not_equal")
                    }
                ],
                group: {
                    name: FilterUtils.getGroupTranslationKey("test"),
                    key: "test"
                }
            });
        });

        it("with custom operator should return a valid config", async () => {
            const filter = new GeoBoundsFilter({
                attribute: "test"
            }).addOperators({
                name: "none"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.GeoBounds,
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    },
                    {
                        id: "not_equal",
                        name: FilterUtils.getOperatorTranslationKey("not_equal")
                    },
                    {
                        id: "none",
                        name: FilterUtils.getCustomOperatorTranslationKey("test", "none")
                    }
                ]
            });
        });

        it("with specified operators should return a valid config", async () => {
            const filter = new GeoBoundsFilter({
                attribute: "test"
            }).setOperators(FilterOperatorTypes.Equal);
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", {});
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.GeoBounds,
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    }
                ]
            });
        });
    });

    describe("getWhereOptions", () => {
        it("with equal operator should return a valid filter config", async () => {
            const filter = new GeoBoundsFilter({
                attribute: "test"
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: [[45.8797953, -73.2815516], [45.8797953, -73.2815516], [45.8797953, -73.2815516], [45.8797953, -73.2815516]],
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>(
                where(
                    fn(
                        "ST_Contains",
                        fn("ST_GeometryFromText", literal("'POLYGON((45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516))'"), 0),
                        "test"
                    ),
                    literal("1")
                )
            );
        });

        it("with equal operator and lat/lng attribytes should return a valid filter config", async () => {
            const filter = new GeoBoundsFilter({
                latAttribute: "latitude",
                lngAttribute: "longitude",
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: [[45.8797953, -73.2815516], [45.8797953, -73.2815516], [45.8797953, -73.2815516], [45.8797953, -73.2815516]],
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>(
                where(
                    fn(
                        "ST_Contains",
                        fn("ST_GeometryFromText", literal("'POLYGON((45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516))'"), 0),
                        fn("Point", "longitude", "latitude")
                    ),
                    literal("1")
                )
            );
        });

        it("with not equal operator custom name should return a valid filter config", async () => {
            const filter = new GeoBoundsFilter({
                attribute: "test"
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: [[45.8797953, -73.2815516], [45.8797953, -73.2815516], [45.8797953, -73.2815516], [45.8797953, -73.2815516]],
                operation: FilterOperatorTypes.NotEqual
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>(
                where(
                    fn(
                        "ST_Contains",
                        fn("ST_GeometryFromText", literal("'POLYGON((45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516, 45.8797953 -73.2815516))'"), 0),
                        "test"
                    ),
                    literal("0")
                )
            );
        });
    });
});
