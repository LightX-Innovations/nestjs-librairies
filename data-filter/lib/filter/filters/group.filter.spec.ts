import { DefaultTranslateAdapter } from "../../adapters/default-translate.adapter";
import { FilterUtils } from "../filter.utils";
import { FilterOperatorTypes } from "../operators";
import { Op, WhereOptions } from "sequelize";
import { GroupFilter } from "./group.filter";
import { SelectFilter } from "./select.filter";
import { NumberFilter } from "./number.filter";
import { RuleModel } from "../models";
import { GroupFilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterType } from "../type";

describe("GroupFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new GroupFilter({
                rootFilter: new SelectFilter({
                    attribute: "test",
                    values: async () => Promise.resolve([{ id: "test", name: "test" }]),
                    lazyLoading: false
                }),
                valueFilter: new NumberFilter({
                    attribute: "value"
                })
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", {});
            expect(config).toBeDefined();
            expect(config).toStrictEqual<GroupFilterBaseConfigurationModel>({
                type: FilterType.Group,
                rootFilter: {
                    type: FilterType.Select,
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
                    values: [{ id: "test", name: "test" }],
                    lazyLoading: false
                },
                valueFilter: {
                    type: FilterType.Number,
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
                            id: "greater",
                            name: FilterUtils.getOperatorTranslationKey("greater")
                        },
                        {
                            id: "greater_or_equal",
                            name: FilterUtils.getOperatorTranslationKey("greater_or_equal")
                        },
                        {
                            id: "less",
                            name: FilterUtils.getOperatorTranslationKey("less")
                        },
                        {
                            id: "less_or_equal",
                            name: FilterUtils.getOperatorTranslationKey( "less_or_equal")
                        }
                    ]
                },
                lazyLoading: false
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new GroupFilter({
                rootFilter: new SelectFilter({
                    attribute: "test",
                    values: async () => Promise.resolve([{ id: "test", name: "test" }]),
                    lazyLoading: false
                }),
                valueFilter: new NumberFilter({
                    attribute: "value"
                }),
                group: "test"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", {});
            expect(config).toBeDefined();
            expect(config).toStrictEqual<GroupFilterBaseConfigurationModel>({
                type: FilterType.Group,
                rootFilter: {
                    type: FilterType.Select,
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
                    values: [{ id: "test", name: "test" }],
                    lazyLoading: false
                },
                valueFilter: {
                    type: FilterType.Number,
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
                            id: "greater",
                            name: FilterUtils.getOperatorTranslationKey("greater")
                        },
                        {
                            id: "greater_or_equal",
                            name: FilterUtils.getOperatorTranslationKey("greater_or_equal")
                        },
                        {
                            id: "less",
                            name: FilterUtils.getOperatorTranslationKey("less")
                        },
                        {
                            id: "less_or_equal",
                            name: FilterUtils.getOperatorTranslationKey( "less_or_equal")
                        }
                    ]
                },
                lazyLoading: false,
                group: {
                    key: "test",
                    name: FilterUtils.getGroupTranslationKey("test")
                }
            });
        });

        it("with lazy loaded value filter should return a valid config", async () => {
            const filter = new GroupFilter({
                rootFilter: new SelectFilter({
                    attribute: "test",
                    values: async () => Promise.resolve([{ id: "test", name: "test" }]),
                    lazyLoading: false
                }),
                getValueFilter: async () => Promise.resolve(new NumberFilter({ attribute: "value" })),
                lazyLoading: false
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", {});
            expect(config).toBeDefined();
            expect(config).toStrictEqual<GroupFilterBaseConfigurationModel>({
                type: FilterType.Group,
                rootFilter: {
                    type: FilterType.Select,
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
                    values: [{ id: "test", name: "test" }],
                    lazyLoading: false
                },
                lazyLoading: false
            });
        });
    });

    describe("getWhereOptions", () => {
        it("should return a valid filter config", async () => {
            const filter = new GroupFilter({
                rootFilter: new SelectFilter({
                    attribute: "test",
                    values: async () => Promise.resolve([{ id: "test", name: "test" }])
                }),
                valueFilter: new NumberFilter({
                    attribute: "value"
                })
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: [
                    {
                        operation: FilterOperatorTypes.Equal,
                        value: "test"
                    },
                    {
                        operation: FilterOperatorTypes.Greater,
                        value: 10
                    }
                ] as [RuleModel, RuleModel],
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                [Op.and]: [
                    {
                        test: "test"
                    },
                    {
                        value: {
                            [Op.gt]: 10
                        }
                    }
                ]
            });
        });

        it("with lazy loaded value filter should return a valid filter config", async () => {
            const filter = new GroupFilter({
                rootFilter: new SelectFilter({
                    attribute: "test",
                    values: async () => Promise.resolve([{ id: "test", name: "test" }])
                }),
                getValueFilter: async () => Promise.resolve(new NumberFilter({ attribute: "value" }))
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: [
                    {
                        operation: FilterOperatorTypes.Equal,
                        value: "test"
                    },
                    {
                        operation: FilterOperatorTypes.Greater,
                        value: 10
                    }
                ] as [RuleModel, RuleModel],
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                [Op.and]: [
                    {
                        test: "test"
                    },
                    {
                        value: {
                            [Op.gt]: 10
                        }
                    }
                ]
            });
        });
    });
});
