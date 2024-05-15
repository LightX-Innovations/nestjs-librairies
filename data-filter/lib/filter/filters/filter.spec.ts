import { Filter } from "./filter";
import { TextFilter } from "./text.filter";
import { FilterOperatorTypes } from "../operators";
import { col, fn, Op, where, WhereOptions } from "sequelize";

describe("Filter", () => {
    describe("getWhereOptions", () => {
        it("should return a valid filter config", async () => {
            const filter = new TextFilter({
                attribute: "test"
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: "test",
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                test: "test"
            });
        });

        it("with custom name should return a valid filter config", async () => {
            const filter = new TextFilter({
                attribute: "test"
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: "test",
                operation: FilterOperatorTypes.Equal
            }, "customName");
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                customName: "test"
            });
        });

        it("with path should return a valid filter config", async () => {
            const filter = new TextFilter({
                attribute: "test",
                path: "path.to.attribute"
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: "test",
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                "$path.to.attribute.test$": "test"
            });
        });

        it("with custom operator should return a valid filter config", async () => {
            const filter = new TextFilter({
                attribute: "test"
            }).addOperators({
                name: "test",
                operator: FilterOperatorTypes.Contains
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: "test",
                operation: "test"
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                test: {
                    [Op.like]: "%test%"
                }
            });
        });

        it("with having defined should return null", async () => {
            const filter = new TextFilter({
                attribute: "test",
                having:fn("count", col("test.email"))
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: "test",
                operation: "test"
            });
            expect(options).toBeNull();
        });
    });

    describe("getHavingOptions", () => {
        it("with no having defined should return null", async () => {
            const filter = new TextFilter({
                attribute: "test"
            });
            const options = await filter.getHavingOptions({
                id: "test",
                value: "test",
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeNull();
        });

        it("with having defined should return a valid filter config", async () => {
            const filter = new TextFilter({
                attribute: "test",
                having: fn("count", col("test.email"))
            });
            const options = await filter.getHavingOptions({
                id: "test",
                value: 0,
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual(where(fn("count", col("test.email")), 0 as any));
        });

        it("with custom operator should return a valid filter config", async () => {
            const filter = new TextFilter({
                attribute: "test"
            }).addOperators({
                name: "none",
                having: where(fn("count", col("system.place.owners.person.email")), {
                    [Op.lte]: 0
                })
            });
            const options = await filter.getHavingOptions({
                id: "test",
                value: null,
                operation: "none"
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual(where(fn("count", col("system.place.owners.person.email")), {
                [Op.lte]: 0
            }));
        });
    });

    describe("getConfig", () => {
        const translationService = { getTranslation: (language: string, key: string) => Promise.resolve(key) };

        it("with enabled undefined it should return the config", async () => {
            const filter = new TextFilter({
                attribute: "test"
            });
            filter.translateService = translationService;
            const config = await filter.getConfig("", null, {});
            expect(config).toBeDefined()
        })

        it("with enabled returning true it should return the config", async () => {
            const filter = new TextFilter({
                attribute: "test",
                enabled: async ({ user, request }) => true
            });
            filter.translateService = translationService;
            const config = await filter.getConfig("", null, {});
            expect(config).toBeDefined()
        })

        it("with enabled returning false it should return null", async () => {
            const filter = new TextFilter({
                attribute: "test",
                enabled: async ({ user, request }) => false
            });
            filter.translateService = translationService;
            const config = await filter.getConfig("", null, {});
            expect(config).toBeNull()
        })
    })
});
