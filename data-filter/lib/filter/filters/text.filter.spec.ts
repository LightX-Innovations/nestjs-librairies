import { DefaultTranslateAdapter } from "../../adapters/default-translate.adapter";
import { FilterUtils } from "../filter.utils";
import { TextFilter } from "./text.filter";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterType } from "../type";
import { FilterOperatorTypes } from "../operators";

describe("TextFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new TextFilter({
                attribute: "test",
                mask: "(000) 000-0000"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Text,
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
                        id: "contains",
                        name: FilterUtils.getOperatorTranslationKey("contains")
                    },
                    {
                        id: "begins_with",
                        name: FilterUtils.getOperatorTranslationKey("begins_with")
                    },
                    {
                        id: "not_begins_with",
                        name: FilterUtils.getOperatorTranslationKey("not_begins_with")
                    },
                    {
                        id: "ends_with",
                        name: FilterUtils.getOperatorTranslationKey("ends_with")
                    },
                    {
                        id: "not_ends_with",
                        name: FilterUtils.getOperatorTranslationKey("not_ends_with")
                    }
                ],
                mask: "(000) 000-0000"
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new TextFilter({
                attribute: "test",
                group: "test"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Text,
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
                        id: "contains",
                        name: FilterUtils.getOperatorTranslationKey("contains")
                    },
                    {
                        id: "begins_with",
                        name: FilterUtils.getOperatorTranslationKey("begins_with")
                    },
                    {
                        id: "not_begins_with",
                        name: FilterUtils.getOperatorTranslationKey("not_begins_with")
                    },
                    {
                        id: "ends_with",
                        name: FilterUtils.getOperatorTranslationKey("ends_with")
                    },
                    {
                        id: "not_ends_with",
                        name: FilterUtils.getOperatorTranslationKey("not_ends_with")
                    }
                ],
                group: {
                    name: FilterUtils.getGroupTranslationKey("test"),
                    key: "test"
                }
            });
        });

        it("with custom operator should return a valid config", async () => {
            const filter = new TextFilter({
                attribute: "test"
            }).addOperators({
                name: "none"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Text,
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
                        id: "contains",
                        name: FilterUtils.getOperatorTranslationKey("contains")
                    },
                    {
                        id: "begins_with",
                        name: FilterUtils.getOperatorTranslationKey("begins_with")
                    },
                    {
                        id: "not_begins_with",
                        name: FilterUtils.getOperatorTranslationKey("not_begins_with")
                    },
                    {
                        id: "ends_with",
                        name: FilterUtils.getOperatorTranslationKey("ends_with")
                    },
                    {
                        id: "not_ends_with",
                        name: FilterUtils.getOperatorTranslationKey("not_ends_with")
                    },
                    {
                        id: "none",
                        name: FilterUtils.getCustomOperatorTranslationKey("test", "none")
                    }
                ]
            });
        });

        it("with specified operators should return a valid config", async () => {
            const filter = new TextFilter({
                attribute: "test"
            }).setOperators(FilterOperatorTypes.Equal, FilterOperatorTypes.NotEqual);
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Text,
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
