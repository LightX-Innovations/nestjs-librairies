import { DefaultTranslateAdapter } from "../../adapters/default-translate.adapter";
import { FilterUtils } from "../filter.utils";
import { SelectFilter } from "./select.filter";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterType } from "../type";
import { FilterOperatorTypes } from "../operators";

describe("SelectFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new SelectFilter({
                attribute: "test",
                values: () => Promise.resolve([{ id: "test", name: "test" }])
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
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
                values: [],
                lazyLoading: true
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new SelectFilter({
                attribute: "test",
                group: "test",
                values: () => Promise.resolve([{ id: "test", name: "test" }])
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
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
                group: {
                    name: FilterUtils.getGroupTranslationKey("test"),
                    key: "test"
                },
                values: [],
                lazyLoading: true
            });
        });

        it("with custom operator should return a valid config", async () => {
            const filter = new SelectFilter({
                attribute: "test",
                values: () => Promise.resolve([{ id: "test", name: "test" }])
            }).addOperators({
                name: "none"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Select,
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
                ],
                values: [],
                lazyLoading: true
            });
        });

        it("with specified operators should return a valid config", async () => {
            const filter = new SelectFilter({
                attribute: "test",
                values: () => Promise.resolve([{ id: "test", name: "test" }])
            }).setOperators(FilterOperatorTypes.Equal);
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Select,
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    }
                ],
                values: [],
                lazyLoading: true
            });
        });

        it("without lazy loading should return a valid config", async () => {
            const filter = new SelectFilter({
                attribute: "test",
                values: () => Promise.resolve([{ id: "test", name: "test" }]),
                lazyLoading: false
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
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
            });
        });
    });
});
