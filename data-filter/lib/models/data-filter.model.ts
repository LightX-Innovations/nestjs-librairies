import { FindAttributeOptions } from "sequelize";
import { Model } from "sequelize-typescript";
import { CustomAttributesConfig, CustomAttributesModel } from "./custom-attributes.model";
import { IncludeConfig } from "./include.model";
import { M, SequelizeUtils } from "../sequelize.utils";

export interface DataFilterConfigModel {
    model: typeof Model;
    attributes?: FindAttributeOptions;
    exportColumns?: string[];
    customAttributes: CustomAttributesConfig[];
}

export class DataFilterConfig implements DataFilterConfigModel {
    public model!: typeof Model;
    public attributes?: FindAttributeOptions;
    public searchableAttributes?: string[];
    public exportColumns?: string[];
    public customAttributes: CustomAttributesConfig[] = [];
    public ignoreInSearch = false;

    public setModel(model: typeof Model) {
        this.model = model;
    }

    public setIgnoreInPath(ignore: boolean) {
        this.ignoreInSearch = ignore;
    }

    public setAttributes(attributes?: FindAttributeOptions) {
        this.attributes = attributes;
    }

    public setSearchableAttributes(attributes: string[]) {
        this.searchableAttributes = attributes;
    }

    public setExportColumns(exportColumns: string[]) {
        this.exportColumns = exportColumns;
    }

    public addCustomAttribute(attribute: CustomAttributesConfig) {
        this.customAttributes.push(attribute);
    }

    public transformAttributesConfig(options?: object): FindAttributeOptions | null {
        const customAttributes = this.getCustomAttributes(options);
        if (this.attributes) {
            if (this.customAttributes.length) {
                const attributes = SequelizeUtils.mergeAttributes(this.attributes, {
                    include: customAttributes.map(x => x.attribute)
                });
                if (!attributes) {
                    return null;
                }

                return SequelizeUtils.ensureAttributesValidity(attributes);
            }

            return SequelizeUtils.ensureAttributesValidity(this.attributes);
        }
        if (!this.attributes && customAttributes.length) {
            return {
                include: customAttributes.map(x => x.attribute)
            };
        }

        return null;
    }

    public getCustomAttributes(options?: object): CustomAttributesModel[] {
        return this.customAttributes
            .map(x => ({
                key: x.key,
                attribute: x.transform(options),
                path: (x.config as any).path ? {
                    path: (x.config as any).path,
                    paranoid: true
                } : null
            } as CustomAttributesModel))
            .filter(x => x.attribute);
    }

    public getCustomAttributesIncludes(): IncludeConfig[] {
        return this.customAttributes
            .filter(x => x.config?.path)
            .map(x => ({
                attributes: { include: [] },
                path: x.config?.path ?? "",
                where: x.config?.where,
                paranoid: true
            }));
    }

    public getSearchableAttributes(): string[] {
        if (this.ignoreInSearch) {
            return [];
        }

        if (this.searchableAttributes) {
            return SequelizeUtils.getModelSearchableFieldAttributes(this.model as typeof M, this.searchableAttributes);
        }

        const searchableAttributes = SequelizeUtils.getModelSearchableAttributes(this.model as typeof M);
        const attributes = SequelizeUtils.getModelSearchableFieldAttributes(this.model as typeof M, this.attributes as string[] ?? []);
        return attributes.length ?
            (attributes as string[])?.filter(x => searchableAttributes.some(attr => attr === x)) :
            searchableAttributes;
    }
}
