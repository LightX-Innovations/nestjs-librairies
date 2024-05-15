import { DefaultAccessControlAdapter, DefaultExportAdapter, DefaultTranslateAdapter } from "./adapters";
import { SearchableAttributes, Distance } from "./decorators";
import { databaseFactory } from "./test/database.factory";
import { DataFilterRepository } from "./data-filter.repository";
import { Attributes, Data, Include, Where } from "./decorators";
import { DataFilterScanner } from "./scanners/data-filter.scanner";
import { SequelizeModelScanner } from "./scanners/sequelize-model.scanner";
import { Persons } from "./test/models/persons/persons.model";
import { Coords } from "./test/models/coords/coords.model";
import { Locations } from "./test/models/locations/locations.model";
import { fn, literal, Op } from "sequelize";

@Data(Persons)
@Attributes(["first_name", "last_name"])
@SearchableAttributes(["first_name"])
class PersonsTest {
    @Attributes(["cellphone"])
    @SearchableAttributes(["address", "postal_code"])
    @Include("location", {
        attributes: ["value"],
        searchableAttributes: ["value", "unique_code"],
        where: { value: option => option.value },
        separate: true
    })
    @Where({ [Op.or]: () => [ { id: { [Op.ne]: null } } ] }, true)
    coord?: Coords;

}

@Data(Persons)
@Attributes(["first_name", "last_name"])
@Distance({ name: "distance", attribute: "geo_point", coordinates: option => option.coordinates, path: "coord" })
class CustomAttributesTest {}

@Data(Persons)
@Attributes(["first_name", "last_name"])
class CustomCoordAttributesTest {
    @Attributes(["cellphone"])
    @Distance({ name: "distance", attribute: "geo_point", coordinates: option => option.coordinates })
    @Include("location", { attributes: ["value"], where: { value: option => option.value } })
    coord?: Coords;
}

describe("DataFilterRepository", () => {
    beforeAll(async () => {
        await databaseFactory();
    });

    describe("PersonsTest", () => {
        let repository: DataFilterRepository<PersonsTest>;

        beforeAll(() => {
            repository = new DataFilterRepository(
                PersonsTest,
                new DataFilterScanner(),
                new SequelizeModelScanner(),
                new DefaultAccessControlAdapter(),
                new DefaultTranslateAdapter(),
                new DefaultExportAdapter()
            );
        });

        it("generateFindOptions should return a valid Sequelize FindOptions object", () => {
            const options = repository.generateFindOptions();
            expect(options).toBeDefined();
            expect(options).toStrictEqual({
                attributes: ["id", "first_name", "last_name"],
                include: [
                    {
                        as: "coord",
                        model: Coords,
                        attributes: ["id", "cellphone"],
                        order: undefined,
                        required: true,
                        paranoid: true,
                        separate: false,
                        include: [
                            {
                                as: "location",
                                model: Locations,
                                attributes: ["value", "id"],
                                order: undefined,
                                include: [],
                                paranoid: true,
                                required: false,
                                separate: true
                            }
                        ]
                    }
                ]
            });
        });

        it("generateFindOptions with conditions should return a valid Sequelize FindOptions object", () => {
            const options = repository.generateFindOptions({}, { value: "Montreal" });
            expect(options).toBeDefined();
            expect(options).toStrictEqual({
                attributes: ["id", "first_name", "last_name"],
                include: [
                    {
                        as: "coord",
                        model: Coords,
                        attributes: ["id", "cellphone"],
                        order: undefined,
                        required: true,
                        paranoid: true,
                        separate: false,
                        where: {
                            [Op.or]: [
                                {
                                    id: {
                                        [Op.ne]: null
                                    }
                                }
                            ]
                        },
                        include: [
                            {
                                as: "location",
                                model: Locations,
                                attributes: ["value", "id"],
                                order: undefined,
                                paranoid: true,
                                required: false,
                                separate: true,
                                include: [],
                                where: {
                                    value: "Montreal"
                                }
                            }
                        ]
                    }
                ]
            });
        });

        it("generateOrderInclude should return a valid Sequelize Includes array", () => {
            const includes = repository.generateOrderInclude({
                column: "coord.location.value",
                direction: "desc"
            });
            expect(includes).toBeDefined();
            expect(includes).toStrictEqual([
                {
                    model: Coords,
                    as: "coord",
                    attributes: [],
                    include: [
                        {
                            model: Locations,
                            as: "location",
                            attributes: ["value"],
                            include: [],
                            required: false,
                            through: undefined
                        }
                    ],
                    required: false,
                    through: undefined
                }
            ]);
        });

        it("reduceObject should return a valid PersonsTest object", () => {
            const person = repository.reduceObject({
                first_name: "Test",
                last_name: "Developer",
                coord: {
                    cellphone: "11111111111",
                    location: {
                        value: "Montreal"
                    }
                }
            });
            expect(person).toBeDefined();

            const res = new PersonsTest();
            Object.assign(res, {
                first_name: "Test",
                last_name: "Developer",
                coord: {
                    cellphone: "11111111111",
                    location: {
                        value: "Montreal"
                    }
                }
            });
            expect(person).toStrictEqual(res);
        });

        it("getSearchableFields should return only searchable fields", () => {
            const fields = repository.getSearchAttributes();
            expect(fields).toBeDefined();
            expect(fields).toEqual([
                {
                    key: "first_name",
                    name: "first_name",
                    isJson: false
                },
                {
                    literalKey: "`coord`.`address`",
                    key: "$coord.address$",
                    name: "address",
                    isJson: false
                },
                {
                    literalKey: "`coord`.`postal_code`",
                    key: "$coord.postal_code$",
                    name: "postal_code",
                    isJson: false
                },
                {
                    literalKey: "`coord->location`.`value`",
                    key: "$coord.location.value$",
                    name: "value",
                    isJson: false
                },
                {
                    literalKey: "`coord->location`.`unique_code`",
                    key: "$coord.location.unique_code$",
                    name: "unique_code",
                    isJson: false
                }
            ])
        });
    });

    describe("CustomAttributesTest", () => {
        let repository: DataFilterRepository<CustomAttributesTest>;

        beforeAll(() => {
            repository = new DataFilterRepository(
                CustomAttributesTest,
                new DataFilterScanner(),
                new SequelizeModelScanner(),
                new DefaultAccessControlAdapter(),
                new DefaultTranslateAdapter(),
                new DefaultExportAdapter()
            );
        });

        it("generateFindOptions with conditions should return a valid Sequelize FindOptions object", () => {
            const options = repository.generateFindOptions({}, { coordinates: [45.8797953, -73.2815516] });
            expect(options).toBeDefined();
            expect(options).toStrictEqual({
                attributes: [
                    "first_name",
                    "last_name",
                    [fn("ST_Distance_Sphere", literal("`coord`.`geo_point`"), fn("ST_GeometryFromText", literal(`'POINT(${45.8797953} ${-73.2815516})'`), 0)), "distance"],
                    "id"
                ],
                include: [
                    {
                        as: "coord",
                        attributes: undefined,
                        model: Coords,
                        order: undefined,
                        paranoid: true,
                        required: false,
                        separate: false,
                        include: []
                    }
                ]
            });
        });
    });

    describe("CustomCoordAttributesTest", () => {
        let repository: DataFilterRepository<CustomCoordAttributesTest>;

        beforeAll(() => {
            repository = new DataFilterRepository(
                CustomCoordAttributesTest,
                new DataFilterScanner(),
                new SequelizeModelScanner(),
                new DefaultAccessControlAdapter(),
                new DefaultTranslateAdapter(),
                new DefaultExportAdapter()
            );
        });

        it("generateFindOptions with conditions should return a valid Sequelize FindOptions object", () => {
            const options = repository.generateFindOptions({}, { value: "Montreal", coordinates: [45.8797953, -73.2815516] });
            expect(options).toBeDefined();
            expect(options).toStrictEqual({
                attributes: [
                    "id",
                    "first_name",
                    "last_name"
                ],
                include: [
                    {
                        as: "coord",
                        model: Coords,
                        attributes: [
                            "cellphone",
                            [fn("ST_Distance_Sphere", literal("`coord`.`geo_point`"),  fn("ST_GeometryFromText", literal(`'POINT(${45.8797953} ${-73.2815516})'`), 0)), "distance"],
                            "id"
                        ],
                        order: undefined,
                        paranoid: true,
                        required: false,
                        separate: false,
                        include: [
                            {
                                as: "location",
                                model: Locations,
                                attributes: ["value", "id"],
                                order: undefined,
                                paranoid: true,
                                required: false,
                                separate: false,
                                include: [],
                                where: {
                                    value: "Montreal"
                                }
                            }
                        ]
                    }
                ]
            });
        });
    });
});
