import { DataFilterUserModel, FilterBaseConfigurationModel } from "../..";
import { FilterType } from "../type";
import { StringOperators } from "../operators";
import { BaseFilterDefinition, Filter } from "./filter";

export interface TextFilterDefinition {
    mask?: string;
}

export class TextFilter extends Filter {
    public type = FilterType.Text;
    public operators = [...StringOperators];
    public mask?: string;

    constructor(definition: TextFilterDefinition & BaseFilterDefinition) {
        super(definition);
    }

    public async getConfig<Request>(key: string, request: Request, user?: DataFilterUserModel): Promise<FilterBaseConfigurationModel | null> {
        if (!this.mask) {
            return super.getConfig(key, request, user);
        }

        const config = await super.getConfig(key, request, user);

        if (!config) {
            return null;
        }

        return {
            ...config,
           mask: this.mask
        };
    }
}
