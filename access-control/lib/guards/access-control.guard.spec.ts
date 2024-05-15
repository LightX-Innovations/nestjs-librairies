import { AccessControlModelRoutes } from "../decorators";
import { AccessActionType } from "../models";
import { AccessControlGuard } from "./access-control.guard";

@AccessControlModelRoutes("account")
class ModelTest1 {}

@AccessControlModelRoutes("coord")
class ModelTest2 {}

@AccessControlModelRoutes("test/coord")
class ModelTest3 {}

describe("AccessControlGuard", () => {
    let guard: AccessControlGuard;

    beforeAll(() => {
        guard = new AccessControlGuard(null as any, null as any, null as any, null as any, null as any);
    });

    it("getModels should return appropriated models", () => {
        const res1 = guard.getModels("/account/:id", [{ type: AccessActionType.Read, resourceIdParameterName: "id" }]);
        expect(res1).toBeDefined();
        expect(res1).toHaveLength(1);
        expect(res1[0]).toBe(ModelTest1);

        const res2 = guard.getModels("/coord/:id", [{ type: AccessActionType.Read, resourceIdParameterName: "id" }]);
        expect(res2).toBeDefined();
        expect(res2).toHaveLength(1);
        expect(res2[0]).toBe(ModelTest2);

        const res3 = guard.getModels("/test/coord/:id", [{ type: AccessActionType.Read, resourceIdParameterName: "id" }]);
        expect(res3).toBeDefined();
        expect(res3).toHaveLength(1);
        expect(res3[0]).toBe(ModelTest3);

        const res4 = guard.getModels("/account/:id/coord/:coordId", [
            {
                type: AccessActionType.Read,
                resourceIdParameterName: "id"
            },
            {
                type: AccessActionType.Read,
                resourceIdParameterName: "coordId"
            }
        ]);
        expect(res4).toBeDefined();
        expect(res4).toHaveLength(2);
        expect(res4[0]).toBe(ModelTest1);
        expect(res4[1]).toBe(ModelTest2);

        const res5 = guard.getModels("/account/:id/test/coord/:coordId", [
            {
                type: AccessActionType.Read,
                resourceIdParameterName: "id"
            },
            {
                type: AccessActionType.Read,
                resourceIdParameterName: "coordId"
            }
        ]);
        expect(res5).toBeDefined();
        expect(res5).toHaveLength(2);
        expect(res5[0]).toBe(ModelTest1);
        expect(res5[1]).toBe(ModelTest3);
    });
});
