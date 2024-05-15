import { Injectable } from "@nestjs/common";
import { col, FindOptions, fn, Op, where } from "sequelize";
import { DefaultAccessControlAdapter, DefaultExportAdapter, DefaultTranslateAdapter } from "../adapters";
import { DataFilterService } from "../data-filter.service";
import { Attributes, Data, Include, Path } from "../decorators";
import { DataFilterScanner } from "../scanners/data-filter.scanner";
import { SequelizeModelScanner } from "../scanners/sequelize-model.scanner";
import { ContractSystems } from "../test/models/contracts/contract-systems.model";
import { Contracts } from "../test/models/contracts/contracts.model";
import { Invoices } from "../test/models/invoices/invoices.model";
import { MaintenanceVisits } from "../test/models/maintenance-visits/maintenance-visits.model";
import { Persons } from "../test/models/persons/persons.model";
import { Owners } from "../test/models/places/owners.model";
import { Places } from "../test/models/places/places.model";
import { Systems } from "../test/models/systems/systems.model";
import { Visits } from "../test/models/visits/visits.model";
import { BaseFilter } from "./base-filter";
import { FilterService } from "./filter.service";
import { NumberFilter, TextFilter } from "./filters";
import { DefaultFilter } from "./filters/default.filter";
import { FilterOperatorTypes } from "./operators";

@Data(ContractSystems)
@Attributes(["active"])
class ContractSystemsTest {
    @Attributes(["paid", "payment_date", "payment_method"])
    @Path("contract.invoice")
    invoice?: Invoices;

    @Attributes(["start_date", "end_date"])
    @Path("contract")
    contract?: Contracts;

    @Attributes([])
    @Path("system.place.owners")
    @Include("person", { attributes: ["email"] })
    owners?: Owners[];
}

@Injectable()
export class TestFilter extends BaseFilter<ContractSystemsTest> {
    public dataDefinition = ContractSystemsTest;

    public defaultFilter = new DefaultFilter({
        id: "email",
        operation: FilterOperatorTypes.Contains,
        value: "@"
    });

    public email = new TextFilter({
        attribute: "email",
        path: "system.place.owners.person",
        group: "owner"
    }).addOperators({
        name: "none",
        having: where(fn("count", col("system.place.owners.person.email")), {
            [Op.lte]: 0
        })
    });

    public name = new TextFilter({
        attribute: "first_name",
        path: "system.place.owners.person",
        group: "owner",
        condition: {
            condition: "and",
            rules: [
                {
                    path: "system.place.owners.person",
                    key: "last_name",
                    value: "Doe",
                    operation: FilterOperatorTypes.Equal
                }
            ]
        }
    });

    public visitCount = new NumberFilter({
        attribute: "id",
        path: "visits.visit",
        group: "visit",
        having: fn("count", col("visits.visit.id"))
    });
}

describe("FilterService", () => {
    let filterService: FilterService<ContractSystemsTest>;

    beforeAll(() => {
        filterService = new FilterService<ContractSystemsTest>(
            new DefaultAccessControlAdapter(),
            new DefaultTranslateAdapter(),
            new TestFilter(),
            new SequelizeModelScanner(),
            new DataFilterService(
                new DataFilterScanner(),
                new SequelizeModelScanner(),
                new DefaultAccessControlAdapter(),
                new DefaultTranslateAdapter(),
                new DefaultExportAdapter()
            )
        );
    });

    it("getFindOptions should return a valid Sequelize FindOptions", async () => {
        const options = await filterService.getFindOptions(ContractSystems, {
            condition: "and",
            rules: [
                {
                    id: "email",
                    value: null,
                    operation: "none"
                },
                {
                    id: "name",
                    value: "John",
                    operation: FilterOperatorTypes.Equal
                },
                {
                    id: "visitCount",
                    value: 2,
                    operation: FilterOperatorTypes.GreaterOrEqual
                }
            ]
        });
        expect(options).toBeDefined();
        expect(options).toStrictEqual({
            include: [
                {
                    as: "system",
                    model: Systems,
                    required: false,
                    paranoid: true,
                    attributes: [],
                    include: [
                        {
                            as: "place",
                            model: Places,
                            required: false,
                            paranoid: true,
                            attributes: [],
                            include: [
                                {
                                    as: "owners",
                                    model: Owners,
                                    required: false,
                                    paranoid: true,
                                    attributes: [],
                                    include: [
                                        {
                                            as: "person",
                                            model: Persons,
                                            order: undefined,
                                            required: false,
                                            separate: false,
                                            paranoid: false,
                                            attributes: [],
                                            include: []
                                        }
                                    ]
                                }
                            ]
                        }
                    ]
                },
                {
                    as: "visits",
                    model: MaintenanceVisits,
                    required: false,
                    attributes: [],
                    include: [
                        {
                            as: "visit",
                            model: Visits,
                            order: undefined,
                            required: false,
                            paranoid: true,
                            separate: false,
                            attributes: [],
                            include: []
                        }
                    ]
                }
            ],
            where: {
                [Op.and]: [
                    {
                        [Op.and]: [
                            {
                                "$system.place.owners.person.first_name$": "John"
                            },
                            {
                                "$system.place.owners.person.last_name$": "Doe"
                            }
                        ]
                    },
                    {
                        "$system.place.owners.person.email$": {
                            [Op.like]: "%@%"
                        }
                    }
                ]
            },
            having: {
                [Op.and]: [
                    where(fn("count", col("system.place.owners.person.email")), {
                        [Op.lte]: 0
                    }),
                    where(fn("count", col("visits.visit.id")), {
                        [Op.gte]: 2
                    })
                ]
            }
        } as FindOptions);
    });
});
