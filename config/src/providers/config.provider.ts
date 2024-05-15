export interface IConfigProvider<Options = any> {
    getValue(key: string, options?: Options): Promise<string | null>;

    // Called once the config model has been instantiated and values has been loaded.
    // This can be used to register functions such as `reload`.
    hydrate?<T extends Object>(config: T): Promise<void>;
}
