import { GeoLocalizationFilter } from "./geo-localization.filter";
import { CoordinateFilter } from "./coordinate.filter";
import { FilterOperatorTypes } from "../operators";
import { FindOptions, fn, literal, Op, where, WhereOptions } from "sequelize";
import { GroupFilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterType } from "../type";
import { RuleModel } from "../models";
import { Data } from "../../decorators";
import { Coords } from "../../test/models/coords/coords.model";
import { BaseFilter } from "../base-filter";
import { FilterService } from "../filter.service";
import { SequelizeModelScanner } from "../../scanners/sequelize-model.scanner";
import { DataFilterService } from "../../data-filter.service";
import { DataFilterScanner } from "../../scanners/data-filter.scanner";

describe("GeoLocalizationFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new GeoLocalizationFilter({
                rootFilter: new CoordinateFilter({
                    attribute: "test"
                })
            });
            const config = await filter.getConfig(null, null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<GroupFilterBaseConfigurationModel>({
                type: FilterType.GeoLocalization,
                rootFilter: {
                    type: FilterType.Coordinate,
                    operators: [
                        {
                            "id": "equal",
                            "name": "equal"
                        },
                        {
                            "id": "not_equal",
                            "name": "not_equal"
                        }
                    ]
                },
                valueFilter: {
                    type: FilterType.Number,
                    operators: [
                        {
                            "id": "equal",
                            "name": "equal"
                        },
                        {
                            "id": "not_equal",
                            "name": "not_equal"
                        },
                        {
                            "id": "greater",
                            "name": "greater"
                        },
                        {
                            "id": "greater_or_equal",
                            "name": "greater_or_equal"
                        },
                        {
                            "id": "less",
                            "name": "less"
                        },
                        {
                            "id": "less_or_equal",
                            "name": "less_or_equal"
                        }
                    ]
                },
                lazyLoading: false
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new GeoLocalizationFilter({
                rootFilter: new CoordinateFilter({
                    attribute: "test"
                }),
                group: "test"
            });
            const config = await filter.getConfig(null, null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<GroupFilterBaseConfigurationModel>({
                type: FilterType.GeoLocalization,
                rootFilter: {
                    type: FilterType.Coordinate,
                    operators: [
                        {
                            "id": "equal",
                            "name": "equal"
                        },
                        {
                            "id": "not_equal",
                            "name": "not_equal"
                        }
                    ]
                },
                valueFilter: {
                    type: FilterType.Number,
                    operators: [
                        {
                            "id": "equal",
                            "name": "equal"
                        },
                        {
                            "id": "not_equal",
                            "name": "not_equal"
                        },
                        {
                            "id": "greater",
                            "name": "greater"
                        },
                        {
                            "id": "greater_or_equal",
                            "name": "greater_or_equal"
                        },
                        {
                            "id": "less",
                            "name": "less"
                        },
                        {
                            "id": "less_or_equal",
                            "name": "less_or_equal"
                        }
                    ]
                },
                lazyLoading: false,
                group: {
                    name: "test",
                    key: "test"
                }
            });
        });
    });

    describe("getWhereOptions", () => {
        beforeEach(() => {
            GeoLocalizationFilter.reset();
        });

        it("should return a valid filter config", async () => {
            const filter = new GeoLocalizationFilter({
                rootFilter: new CoordinateFilter({
                    attribute: "test"
                })
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: [
                    {
                        operation: FilterOperatorTypes.Equal,
                        value: [45.8797953, -73.2815516]
                    },
                    {
                        operation: FilterOperatorTypes.LessOrEqual,
                        value: 1000
                    }
                ] as [RuleModel, RuleModel],
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>(
                where(fn("ST_Distance_Sphere", literal("test"), literal(`point(${45.8797953}, ${-73.2815516})`)), {
                    [Op.lte]: 1000
                })
            );
        });
    });
});

@Data(Coords)
class GeoLocalizationTestData {}

class GeoLocalizationTestFilter extends BaseFilter<GeoLocalizationTestData> {
    public dataDefinition = GeoLocalizationTestData;

    public distance = new GeoLocalizationFilter({
        rootFilter: new CoordinateFilter({
            attribute: "geo_point"
        })
    });
}

describe("GeoLocalizationTestFilter", () => {
    let filter: FilterService<GeoLocalizationTestData>;

    beforeAll(() => {
        filter = new FilterService(
            null,
            new GeoLocalizationTestFilter(),
            new SequelizeModelScanner(),
            new DataFilterService(
                new DataFilterScanner(),
                new SequelizeModelScanner()
            )
        );
    });

    it("getFindOptions should return a valid options config", async () => {
        const options = await filter.getFindOptions(Coords, {
            condition: "and",
            rules: [
                {
                    id: "distance",
                    operation: FilterOperatorTypes.Equal,
                    value: [
                        {
                            value: [45.8797953, -73.2815516],
                            operation: FilterOperatorTypes.Equal
                        },
                        {
                            value: 25000,
                            operation: FilterOperatorTypes.LessOrEqual
                        }
                    ] as [RuleModel, RuleModel]
                },
                {
                    id: "distance",
                    operation: FilterOperatorTypes.Equal,
                    value: [
                        {
                            value: [45.8797953, -73.2815516],
                            operation: FilterOperatorTypes.Equal
                        },
                        {
                            value: 5000,
                            operation: FilterOperatorTypes.LessOrEqual
                        }
                    ] as [RuleModel, RuleModel]
                }
            ]
        });
        expect(options).toBeDefined();
        expect(options).toStrictEqual<FindOptions>({
            group: "Coords.id",
            include: [],
            where: {
                [Op.and]: [
                    where(fn("ST_Distance_Sphere", literal("geo_point"), literal(`point(${45.8797953}, ${-73.2815516})`)), {
                        [Op.lte]: 25000
                    }),
                    where(fn("ST_Distance_Sphere", literal("geo_point"), literal(`point(${45.8797953}, ${-73.2815516})`)), {
                        [Op.lte]: 5000
                    }),
                ]
            }
        });
    });
});
