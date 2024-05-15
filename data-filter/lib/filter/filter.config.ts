export interface FilterOptionConfig {
    maxPage: number;
    disableAccessControl?: boolean;
}

export const defaultFilterOptionConfig: FilterOptionConfig = {
    maxPage: 100,
    disableAccessControl: false
};
