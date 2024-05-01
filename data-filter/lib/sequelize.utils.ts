import { ArrayUtils, TypeUtils } from "@lightx-innovations/nestjs-common";
import {
    AbstractDataTypeConstructor,
    FindAttributeOptions,
    IncludeOptions,
    Includeable,
    Op,
    Order,
    OrderItem,
    WhereOptions,
} from "sequelize";
import { Model } from "sequelize-typescript";
import { ProjectionAlias, WhereAttributeHashValue } from "sequelize/types/model";
import { RuleModel } from "./filter";
import { IncludeWhereModel } from "./models/include.model";

export interface GeoPoint {
    type: "point";
    coordinates: number[];
}

export class M extends Model {}

export class SequelizeUtils {
    public static reduceIncludes(
        includes: Array<IncludeOptions | IncludeOptions[]>,
        ignoreAttributes = false
    ): Includeable[] {
        let include: IncludeOptions[] = [];
        for (const i of includes) {
            include = this.mergeIncludes(include, i, ignoreAttributes);
        }

        return include;
    }

    public static mergeIncludes(
        a: IncludeOptions | IncludeOptions[] = [],
        b: IncludeOptions | IncludeOptions[] = [],
        ignoreAttributes = false
    ) {
        if (!Array.isArray(a)) {
            a = [a];
        }

        if (!Array.isArray(b)) {
            b = [b];
        }

        for (const bChild of b) {
            const aChild = a.find((value) => value.model === bChild.model && value.as === bChild.as);
            if (aChild) {
                aChild.include = this.mergeIncludes(
                    (aChild.include as IncludeOptions[]) ?? [],
                    (bChild.include as IncludeOptions[]) ?? [],
                    ignoreAttributes
                );
                if ((aChild.attributes || bChild.attributes) && !ignoreAttributes) {
                    aChild.attributes = this.mergeAttributes(aChild.attributes, bChild.attributes);
                }
                const where = this.mergeWhere(aChild.where, bChild.where);
                if (where) {
                    aChild.where = where;
                }
                const order = this.mergeOrder(aChild.order, bChild.order);
                if (order) {
                    aChild.order = order;
                }
                if (aChild.required || bChild.required) {
                    aChild.required = true;
                }
                if (aChild.separate || bChild.separate) {
                    aChild.separate = true;
                }
                if (bChild.limit) {
                    aChild.limit ??= bChild.limit;
                }
                aChild.paranoid = !(aChild.paranoid === false || bChild.paranoid === false);
                if (
                    TypeUtils.isNotNullOrUndefined(aChild.subQuery) ||
                    TypeUtils.isNotNullOrUndefined(bChild.subQuery)
                ) {
                    aChild.subQuery = aChild.subQuery ?? bChild.subQuery;
                }
            } else {
                a.push(bChild);
            }
        }

        return a;
    }

    public static mergeAttributes(a: FindAttributeOptions, b: FindAttributeOptions): FindAttributeOptions {
        type Attr = { exclude?: string[]; include?: (string | ProjectionAlias)[] };

        if (a instanceof Array && b instanceof Array) {
            return ArrayUtils.uniqueValues([...a, ...b, "id"], (x) => x);
        } else if (a || b) {
            const aAttributes = (a ?? {}) as Attr;
            const bAttributes = (b ?? {}) as Attr;

            if (aAttributes.include && !b) {
                return a;
            }

            if (bAttributes.include && !a) {
                return b;
            }

            if (a instanceof Array) {
                const bAttr = (b ?? {}) as Attr;
                if (bAttr.include?.length) {
                    return ArrayUtils.uniqueValues([...a, ...bAttr.include, "id"], (x) => x);
                }

                return b ? ArrayUtils.uniqueValues([...a, "id"], (x) => x) : b;
            }

            if (b instanceof Array) {
                const aAttr = (a ?? {}) as Attr;
                if (aAttr.include?.length) {
                    return ArrayUtils.uniqueValues([...b, ...aAttr.include, "id"], (x) => x);
                }

                return a ? ArrayUtils.uniqueValues([...b, "id"], (x) => x) : a;
            }

            const result: Attr = {};
            if (aAttributes.include?.length) {
                result.include = [...aAttributes.include];
            }
            if (bAttributes.include?.length) {
                result.include = [...(result.include ?? []), ...bAttributes.include];
            }

            if (aAttributes.exclude?.length) {
                result.exclude = [...aAttributes.exclude];
            }
            if (bAttributes.exclude?.length) {
                result.exclude = [...(result.exclude ?? []), ...bAttributes.exclude];
            }

            if (result.include) {
                result.include = ArrayUtils.uniqueValues(result.include, (x) => x);
            }
            if (result.exclude) {
                result.exclude = ArrayUtils.uniqueValues(result.exclude, (x) => x);
            }

            if (!result.include && !result.exclude) {
                return undefined;
            }

            return result as FindAttributeOptions;
        }
        return undefined;
    }

    public static ensureAttributesValidity(attribute: FindAttributeOptions): FindAttributeOptions {
        if (attribute instanceof Array) {
            if (attribute.find((x) => x === "id")) {
                return attribute;
            }
            return ["id", ...attribute];
        }

        if (attribute.exclude) {
            return {
                exclude: attribute.exclude.filter((x) => x !== "id"),
            };
        }

        return attribute;
    }

    public static mergeWhere(a: WhereOptions, b: WhereOptions): WhereOptions {
        if (!a && !b) {
            return null;
        }
        return Object.assign(a ?? {}, b ?? {});
    }

    public static mergeOrder(a: Order, b: Order): Order {
        if (!a && !b) {
            return null;
        }
        if (a && !b) {
            return a;
        }
        if (!a && b) {
            return b;
        }

        const res: OrderItem[] = [];
        if (a instanceof Array) {
            res.push(...a);
        } else {
            res.push(a);
        }
        if (b instanceof Array) {
            res.push(...b);
        } else {
            res.push(b);
        }
        return res;
    }

    public static generateWhereValue(rule: RuleModel): WhereAttributeHashValue<any> {
        switch (rule.operation) {
            case "equal":
                return rule.value as any;

            case "not_equal":
                return { [Op.ne]: rule.value };

            case "in":
                return { [Op.in]: rule.value as any[] };

            case "not_in":
                return { [Op.notIn]: rule.value as any[] };

            case "less":
                return { [Op.lt]: rule.value as any };

            case "less_or_equal":
                return { [Op.lte]: rule.value as any };

            case "greater":
                return { [Op.gt]: rule.value as any };

            case "greater_or_equal":
                return { [Op.gte]: rule.value as any };

            case "between":
                return { [Op.between]: rule.value as any };

            case "not_between":
                return { [Op.notBetween]: rule.value as any };

            case "is_null":
                return { [Op.eq]: null };

            case "is_not_null":
                return { [Op.ne]: null };

            case "begins_with":
                return { [Op.like]: `${rule.value}%` };

            case "not_begins_with":
                return { [Op.notLike]: `${rule.value}%` };

            case "contains":
                return { [Op.like]: `%${rule.value}%` };

            case "not_contains":
                return { [Op.notLike]: `%${rule.value}%` };

            case "ends_with":
                return { [Op.like]: `%${rule.value}` };

            case "not_ends_with":
                return { [Op.notLike]: `%${rule.value}` };

            case "is_empty":
                return "";

            case "is_not_empty":
                return { [Op.ne]: "" };
        }
    }

    public static getAttributeFullName(attribute: string, path: string) {
        return `$${path}.${attribute}$`;
    }

    public static getLiteralFullName(attribute: string, path: string | string[]) {
        if (typeof path === "string") {
            path = path.split(".");
        }
        return `\`${path.join("->")}\`.\`${attribute}\``;
    }

    public static getOrderFullName(attribute: string, path: string[]) {
        return `${path.join("->")}.${attribute}`;
    }

    public static getModelSearchableAttributes(model: typeof M): string[] {
        return Object.keys(model.rawAttributes)
            .filter(
                (a) =>
                    !["DATE", "DATEONLY", "VIRTUAL"].some(
                        (t) => t === (model.rawAttributes[a].type as AbstractDataTypeConstructor).key
                    )
            )
            .map((x) => {
                const attr = model.rawAttributes[x];
                if (!attr) {
                    return x;
                }
                return attr.field ? attr.field : x;
            });
    }

    public static getModelSearchableFieldAttributes(model: typeof M, fields: string[]): string[] {
        const attributes = model.rawAttributes;
        return fields
            .filter((x) => {
                const attr = attributes[x];
                if (!attr) {
                    return false;
                }

                return !["DATE", "DATEONLY", "VIRTUAL"].some(
                    (t) => t === (attr.type as AbstractDataTypeConstructor).key
                );
            })
            .map((x) => {
                const attr = attributes[x];
                if (!attr) {
                    return x;
                }

                return attr.field ? attr.field : x;
            });
    }

    public static reduceModelFromPath(model: M, path: string) {
        const steps = path.split(".");

        let step = steps.shift();
        while (step) {
            if (model[step] instanceof Array) {
                if (!steps.length) {
                    return model[step];
                }

                return (model[step] as Array<any>)
                    .map((x) => this.reduceModelFromPath(x, steps.join(".")))
                    .reduce((all, current) => {
                        if (current instanceof Array) {
                            return [...all, ...current];
                        }
                        return [...all, current];
                    }, []);
            }

            model = model[step];
            if (!model) {
                return undefined;
            }

            step = steps.shift();
        }

        return model;
    }

    public static findColumnFieldName(model: typeof M, name: string): string {
        const field = Object.keys(model.rawAttributes).find((key) => {
            if (key === name) {
                return true;
            }

            return model.rawAttributes[key].field === name;
        });
        return model.rawAttributes[field].field ?? name;
    }

    public static isColumnJson(model: typeof M, name: string): boolean {
        const attr = model.rawAttributes[name] ?? Object.values(model.rawAttributes).find((x) => x.field === name);
        return (attr?.type as AbstractDataTypeConstructor)?.key === "JSON";
    }

    public static getGroupLiteral(model: typeof M, group: string): string {
        const items = group.split(".");
        if (items.length > 1) {
            const column = items[items.length - 1];
            return SequelizeUtils.getLiteralFullName(column, items.slice(0, items.length - 1));
        }

        return `\`${model.name}\`.\`${group}\``;
    }

    public static generateWhereConditions(model: IncludeWhereModel, options?: object): WhereOptions {
        const where = {};
        const keys = [...Object.keys(model), ...Object.getOwnPropertySymbols(model)];
        for (const key of keys) {
            if (!model.hasOwnProperty(key)) {
                continue;
            }

            const value = model[key as any](options);
            if (typeof value !== "undefined") {
                where[key] = value;
            }
        }

        return where;
    }
}
