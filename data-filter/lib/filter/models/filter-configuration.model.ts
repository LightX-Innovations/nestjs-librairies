import { FilterType } from "../type";
import { OptionsFilterOptionConfiguration, OptionsFilterSelectionMode } from "../filters";

export interface FilterOperatorsConfiguration {
    id: string;
    name: string;
}

export interface FilterGroupConfiguration {
    key: string;
    name: string;
}

export interface FilterBaseConfigurationModel {
    type: FilterType;
    operators: FilterOperatorsConfiguration[];
    values?: unknown[];
    lazyLoading?: boolean;
    selectionMode?: OptionsFilterSelectionMode;
    options?: OptionsFilterOptionConfiguration[];
    group?: FilterGroupConfiguration;
    mask?: string;
}

export interface FilterConfigurationModel extends FilterBaseConfigurationModel {
    id: string;
    name: string;
}

export interface GroupFilterBaseConfigurationModel {
    type: FilterType;
    rootFilter: FilterBaseConfigurationModel | null;
    valueFilter?: FilterBaseConfigurationModel | null;
    lazyLoading?: boolean;
    group?: FilterGroupConfiguration;
}

export interface GroupFilterConfigurationModel extends GroupFilterBaseConfigurationModel {
    id: string;
    name: string;
}
