import { DefaultTranslateAdapter } from "../../adapters/default-translate.adapter";
import { FilterUtils } from "../filter.utils";
import { NumberFilter } from "./number.filter";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterType } from "../type";
import { FilterOperatorTypes } from "../operators";

describe("NumberFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new NumberFilter({
                attribute: "test"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
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
                        name: FilterUtils.getOperatorTranslationKey("less_or_equal")
                    }
                ]
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new NumberFilter({
                attribute: "test",
                group: "test"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
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
                        name: FilterUtils.getOperatorTranslationKey("less_or_equal")
                    }
                ],
                group: {
                    name: FilterUtils.getGroupTranslationKey("test"),
                    key: "test"
                }
            });
        });

        it("with custom operator should return a valid config", async () => {
            const filter = new NumberFilter({
                attribute: "test"
            }).addOperators({
                name: "none"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
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
                        name: FilterUtils.getOperatorTranslationKey("less_or_equal")
                    },
                    {
                        id: "none",
                        name: FilterUtils.getCustomOperatorTranslationKey("test", "none")
                    }
                ]
            });
        });

        it("with specified operators should return a valid config", async () => {
            const filter = new NumberFilter({
                attribute: "test"
            }).setOperators(FilterOperatorTypes.Equal, FilterOperatorTypes.NotEqual);
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Number,
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
    });
});
