import { TypeUtils } from "@lightx-innovations/nestjs-common";
import { Injectable } from "@nestjs/common";
import { FindAttributeOptions, IncludeOptions, literal, Order } from "sequelize";
import { Association, BaseAssociation, getAssociations, Model } from "sequelize-typescript";
import { IncludeModel, OrderModel } from "..";
import { PathModel } from "../models/path.model";
import { SearchAttributesModel } from "../models/search-attributes.model";
import { M, SequelizeUtils } from "../sequelize.utils";

@Injectable()
export class SequelizeModelScanner {
    public getIncludes(
        model: typeof Model,
        path: PathModel,
        additionalIncludes: IncludeModel[],
        attributes?: FindAttributeOptions | null,
        ignoreAttributes = false
    ): IncludeOptions[] {
        const objects = path?.path?.split(".");
        if (!objects?.length) {
            return [];
        }

        const result: IncludeOptions[] = [];
        let includes: IncludeOptions[] = result;
        let i = 0;
        for (const obj of objects) {
            const association = this.findAssociation(model, obj);
            includes.push({
                as: association.getAs() as string,
                model: association.getAssociatedClass(),
                attributes: ignoreAttributes ? [] : { include: [] },
                include: [],
                required: false,
            });

            if (i++ < objects.length - 1) {
                model = includes[0].model as unknown as typeof Model;
                includes = includes[0].include as IncludeOptions[];
            }
        }

        if (attributes) {
            includes[0].attributes = ignoreAttributes
                ? []
                : SequelizeUtils.mergeAttributes(includes[0].attributes, attributes);
        }
        if (path.where) {
            includes[0].where = SequelizeUtils.mergeWhere(includes[0].where, path.where);
            includes[0].required = !!path.required;
        }
        if (path.required) {
            includes[0].required = true;
        }
        if (path.limit) {
            includes[0].limit = path.limit;
        }

        includes[0].paranoid = !!path.paranoid;
        includes[0].separate = !!path.separate;
        includes[0].order = path.order;

        if (TypeUtils.isNotNullOrUndefined(path.subQuery)) {
            includes[0].subQuery = path.subQuery;
        }

        const addIncludes: IncludeOptions[][] = [];
        for (const include of additionalIncludes) {
            addIncludes.push(
                this.getIncludes(
                    includes[0].model as unknown as typeof Model,
                    {
                        path: include.path,
                        order: include.order,
                        where: include.where,
                        required: include.required,
                        separate: include.separate,
                        paranoid: include.paranoid,
                        subQuery: include.subQuery,
                        limit: include.limit,
                    },
                    [],
                    include.attributes,
                    ignoreAttributes
                )
            );
        }

        includes[0].include?.push(...SequelizeUtils.reduceIncludes(addIncludes, ignoreAttributes));

        return result;
    }

    public getAttributes(
        model: typeof Model,
        path: PathModel,
        additionalIncludes: IncludeModel[],
        attributes?: FindAttributeOptions
    ): SearchAttributesModel[] {
        const objects = path.path.split(".");
        if (!objects.length) {
            return [];
        }

        const result: SearchAttributesModel[] = [];
        for (const obj of objects) {
            const association = this.findAssociation(model, obj);
            model = association.getAssociatedClass() as unknown as typeof Model;
        }
        attributes = attributes
            ? SequelizeUtils.getModelSearchableFieldAttributes(model as typeof M, attributes as string[])
            : SequelizeUtils.getModelSearchableAttributes(model as typeof M);
        result.push(
            ...(attributes as string[]).map((a) => ({
                name: a,
                key: SequelizeUtils.getAttributeFullName(a, path.path),
                literalKey: SequelizeUtils.getLiteralFullName(a, path.path),
                isJson: SequelizeUtils.isColumnJson(model as typeof M, a),
            }))
        );

        for (const include of additionalIncludes) {
            if (include.ignoreInSearch) {
                continue;
            }

            result.push(
                ...this.getAttributes(
                    model as typeof Model,
                    {
                        path: include.path,
                    },
                    [],
                    include.searchableAttributes ?? include.attributes
                ).map((a) => ({
                    name: a.name,
                    key: SequelizeUtils.getAttributeFullName(a.name, [path.path, include.path].join(".")),
                    literalKey: SequelizeUtils.getLiteralFullName(a.name, [path.path, include.path].join(".")),
                    isJson: a.isJson,
                }))
            );
        }

        return result;
    }

    public getOrder(model: typeof Model, orderObj: OrderModel): Order | undefined {
        if (!orderObj?.column || !orderObj.direction) {
            return;
        }

        const values = orderObj.column.split(".");
        const column = values.pop() as string;
        for (const value of values) {
            const association = this.findAssociation(model, value);
            model = association.getAssociatedClass() as unknown as typeof Model;
        }
        const col = SequelizeUtils.findColumnFieldName(model as typeof M, column);
        let literalOrder = values.length
            ? SequelizeUtils.getLiteralFullName(col, values)
            : `\`${model.name}\`.\`${col}\``;

        if (orderObj.nullLast) {
            literalOrder = `-${literalOrder}`;
            orderObj.direction = orderObj.direction === "asc" ? "desc" : "asc";
        }

        if (orderObj.direction === "desc") {
            literalOrder += ` DESC`;
        }
        return literal(literalOrder) as Order;
    }

    public getGroup(model: typeof Model, orderObj: OrderModel): string[] {
        if (!orderObj || !orderObj.column || orderObj.direction === "") {
            return [];
        }

        const group: string[] = [];
        const values = orderObj.column.split(".");
        const column = values.pop() as string;
        for (const value of values) {
            const association = this.findAssociation(model, value);
            model = association.getAssociatedClass() as unknown as typeof Model;
            group.push(value);
        }
        return [
            SequelizeUtils.getOrderFullName("id", group),
            SequelizeUtils.getOrderFullName(SequelizeUtils.findColumnFieldName(model as typeof M, column), group),
        ];
    }

    public getOrderIncludes(model: typeof Model, orderObj: OrderModel): IncludeOptions[] {
        if (!orderObj || !orderObj.column || orderObj.direction === "") {
            return [];
        }

        const values = orderObj.column.split(".");
        if (values.length <= 1) {
            return [];
        }

        const column = values.pop() as string;
        const result: IncludeOptions[] = [];
        let includes: IncludeOptions[] = result;
        let i = 0;
        for (const value of values) {
            const association = this.findAssociation(model, value);
            includes.push({
                as: association.getAs() as string,
                model: association.getAssociatedClass(),
                attributes: [],
                include: [],
                required: false,
                through:
                    association.getAssociation() === Association.BelongsToMany
                        ? {
                              attributes: [],
                          }
                        : undefined,
            });

            if (i++ < values.length - 1) {
                model = includes[0].model as unknown as typeof Model;
                includes = includes[0].include as IncludeOptions[];
            }
        }

        includes[0].attributes = [column];
        return result;
    }

    private findAssociation(model: typeof Model, obj: string): BaseAssociation<any, any> {
        const associations = getAssociations(model.prototype) ?? [];

        const association = associations.find((a) => a.getAs() === obj);
        if (!association) {
            throw new Error(`Unable to load association for ${obj}`);
        }
        return association;
    }
}
