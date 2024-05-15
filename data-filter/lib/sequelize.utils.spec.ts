import { SequelizeUtils } from "./sequelize.utils";

describe("SequelizeUtils", () => {
    describe("mergeAttributes", () => {
        it("Merge no attributes should return no attributes", () => {
            const a = undefined;
            const b = undefined;

            const res = SequelizeUtils.mergeAttributes(a, b);
            expect(res).toEqual(undefined);
        });

        it("Merge array attributes should merge in one array", () => {
            const a = ["id", "name"];
            const b = ["email", "phone"];

            const res = SequelizeUtils.mergeAttributes(a, b);
            expect(res).toEqual(["id", "name", "email", "phone"]);
        });

        it("Merge two include objects should return a valid object", () => {
            const a = { include: ["new_attr"] };
            const b = { include: ["other_new_attr"] };

            const res = SequelizeUtils.mergeAttributes(a, b);
            expect(res).toEqual({ include: ["new_attr", "other_new_attr"] });
        });

        it("Merge two exclude objects should return a valid object", () => {
            const a = { exclude: ["attr_to_remove"] };
            const b = { exclude: ["other_attr_to_remove"] };

            const res = SequelizeUtils.mergeAttributes(a, b);
            expect(res).toEqual({ exclude: ["attr_to_remove", "other_attr_to_remove"] });
        });

        it("Merge array and no attributes should return no attributes", () => {
            const a = ["id", "name"];
            const b = undefined;

            const res = SequelizeUtils.mergeAttributes(a, b);
            expect(res).toEqual(undefined);

            const a2 = undefined;
            const b2 = ["id", "name"];

            const res2 = SequelizeUtils.mergeAttributes(a2, b2);
            expect(res2).toEqual(undefined);
        });

        it("Merge include object and no attributes should return the include object", () => {
            const a = { include: ["new_attr"] };
            const b = undefined;

            const res = SequelizeUtils.mergeAttributes(a, b);
            expect(res).toEqual({ include: ["new_attr"] });

            const a2 = undefined;
            const b2 = { include: ["new_attr"] };

            const res2 = SequelizeUtils.mergeAttributes(a2, b2);
            expect(res2).toEqual({ include: ["new_attr"] });
        });

        it("Merge include empty object and empty attributes should return the attribute with the id", () => {
            const a = { include: [] };
            const b: any[] = [];

            const res = SequelizeUtils.mergeAttributes(a, b);
            expect(res).toEqual(["id"]);

            const a2: any[] = [];
            const b2 = { include: [] };

            const res2 = SequelizeUtils.mergeAttributes(a2, b2);
            expect(res2).toEqual(["id"]);
        });
    });
});
