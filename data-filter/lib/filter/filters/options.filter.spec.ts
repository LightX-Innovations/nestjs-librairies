import { Op, WhereOptions } from "sequelize";
import { DefaultTranslateAdapter } from "../../adapters/default-translate.adapter";
import { FilterUtils } from "../filter.utils";
import { FilterBaseConfigurationModel } from "../models/filter-configuration.model";
import { FilterOperatorTypes } from "../operators";
import { FilterType } from "../type";
import { OptionsFilter, RadioFilter } from "./options.filter";

describe("RadioFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new RadioFilter({
                attribute: "test",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Radio,
                selectionMode: "radio",
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    }
                ],
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new RadioFilter({
                attribute: "test",
                group: "test",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Radio,
                selectionMode: "radio",
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    }
                ],
                group: {
                    name: FilterUtils.getGroupTranslationKey("test"),
                    key: "test"
                },
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });

        it("with custom operator should return a valid config", async () => {
            const filter = new RadioFilter({
                attribute: "test",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            }).addOperators({
                name: "none"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Radio,
                selectionMode: "radio",
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    },
                    {
                        id: "none",
                        name: FilterUtils.getCustomOperatorTranslationKey("test", "none")
                    }
                ],
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });

        it("with specified operators should return a valid config", async () => {
            const filter = new RadioFilter({
                attribute: "test",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            }).setOperators(FilterOperatorTypes.NotEqual);
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Radio,
                selectionMode: "radio",
                operators: [
                    {
                        id: "not_equal",
                        name: FilterUtils.getOperatorTranslationKey("not_equal")
                    }
                ],
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });
    });

    describe("getWhereOptions", () => {
        it("with conditions should include all conditions in the where options", async () => {
            const filter = new RadioFilter({
                attribute: "test",
                options: [
                    {
                        key: "no",
                        value: null,
                        operator: FilterOperatorTypes.IsNotNull,
                        condition: {
                            condition: "or",
                            rules: [
                                {
                                    condition: "or",
                                    rules: [
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotNull,
                                            value: null
                                        },
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotEmpty,
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: "no",
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                [Op.or]: [
                    {
                        [Op.or]: [
                            {
                                test_2: {
                                    [Op.ne]: null
                                }
                            },
                            {
                                test_2: {
                                    [Op.ne]: ""
                                }
                            }
                        ]
                    },
                    {
                        "test": {
                            [Op.ne]: null
                        }
                    }
                ]
            });
        });
    });

    describe("getIncludePaths", () => {
        it("with conditions containing path should returns the paths", async () => {
            const filter = new RadioFilter({
                attribute: "test",
                options: [
                    {
                        key: "no",
                        value: null,
                        operator: FilterOperatorTypes.IsNotNull,
                        condition: {
                            condition: "or",
                            rules: [
                                {
                                    condition: "or",
                                    rules: [
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotNull,
                                            path: "test_2",
                                            value: null
                                        },
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotEmpty,
                                            path: "test_2",
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            const paths = filter.getIncludePaths({
                id: "test",
                value: "no",
                operation: FilterOperatorTypes.Equal
            });
            expect(paths).toBeDefined();
            expect(paths).toStrictEqual([
                {
                    path: "test_2",
                    where: undefined
                }
            ]);
        });
    });
});

describe("OptionsFilter", () => {
    describe("getConfig", () => {
        it("should return a valid config", async () => {
            const filter = new OptionsFilter({
                attribute: "test",
                selectionMode: "select",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Options,
                selectionMode: "select",
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    }
                ],
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });

        it("with group should return a valid config", async () => {
            const filter = new OptionsFilter({
                attribute: "test",
                group: "test",
                selectionMode: "select",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Options,
                selectionMode: "select",
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    }
                ],
                group: {
                    name: FilterUtils.getGroupTranslationKey("test"),
                    key: "test"
                },
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });

        it("with custom operator should return a valid config", async () => {
            const filter = new OptionsFilter({
                attribute: "test",
                selectionMode: "select",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            }).addOperators({
                name: "none"
            });
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Options,
                selectionMode: "select",
                operators: [
                    {
                        id: "equal",
                        name: FilterUtils.getOperatorTranslationKey("equal")
                    },
                    {
                        id: "none",
                        name: FilterUtils.getCustomOperatorTranslationKey("test", "none")
                    }
                ],
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });

        it("with specified operators should return a valid config", async () => {
            const filter = new OptionsFilter({
                attribute: "test",
                selectionMode: "select",
                options: [
                    {
                        key: "yes",
                        value: 1
                    },
                    {
                        key: "no",
                        value: 0
                    }
                ]
            }).setOperators(FilterOperatorTypes.NotEqual);
            filter.translateService = new DefaultTranslateAdapter();
            const config = await filter.getConfig("test", null);
            expect(config).toBeDefined();
            expect(config).toStrictEqual<FilterBaseConfigurationModel>({
                type: FilterType.Options,
                selectionMode: "select",
                operators: [
                    {
                        id: "not_equal",
                        name: FilterUtils.getOperatorTranslationKey("not_equal")
                    }
                ],
                options: [
                    {
                        key: "yes",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "yes")
                    },
                    {
                        key: "no",
                        name: FilterUtils.getRadioOptionTranslationKey("test", "no")
                    }
                ]
            });
        });
    });

    describe("getWhereOptions", () => {
        it("with conditions should include all conditions in the where options", async () => {
            const filter = new OptionsFilter({
                attribute: "test",
                selectionMode: "select",
                options: [
                    {
                        key: "no",
                        value: null,
                        operator: FilterOperatorTypes.IsNotNull,
                        condition: {
                            condition: "or",
                            rules: [
                                {
                                    condition: "or",
                                    rules: [
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotNull,
                                            value: null
                                        },
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotEmpty,
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            const options = await filter.getWhereOptions({
                id: "test",
                value: "no",
                operation: FilterOperatorTypes.Equal
            });
            expect(options).toBeDefined();
            expect(options).toStrictEqual<WhereOptions>({
                [Op.or]: [
                    {
                        [Op.or]: [
                            {
                                test_2: {
                                    [Op.ne]: null
                                }
                            },
                            {
                                test_2: {
                                    [Op.ne]: ""
                                }
                            }
                        ]
                    },
                    {
                        "test": {
                            [Op.ne]: null
                        }
                    }
                ]
            });
        });
    });

    describe("getIncludePaths", () => {
        it("with conditions containing path should returns the paths", async () => {
            const filter = new OptionsFilter({
                attribute: "test",
                selectionMode: "select",
                options: [
                    {
                        key: "no",
                        value: null,
                        operator: FilterOperatorTypes.IsNotNull,
                        condition: {
                            condition: "or",
                            rules: [
                                {
                                    condition: "or",
                                    rules: [
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotNull,
                                            path: "test_2",
                                            value: null
                                        },
                                        {
                                            key: "test_2",
                                            operation: FilterOperatorTypes.IsNotEmpty,
                                            path: "test_2",
                                            value: null
                                        }
                                    ]
                                }
                            ]
                        }
                    }
                ]
            });
            const paths = filter.getIncludePaths({
                id: "test",
                value: "no",
                operation: FilterOperatorTypes.Equal
            });
            expect(paths).toBeDefined();
            expect(paths).toStrictEqual([
                {
                    path: "test_2",
                    where: undefined
                }
            ]);
        });
    });
});
