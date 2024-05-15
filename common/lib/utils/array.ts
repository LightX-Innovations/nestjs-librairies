export class ArrayUtils {
    public static groupBy<Item, Key, Value>(
        array: Item[],
        keySelector: (item: Item) => Key,
        valueSelector: (item: Item) => Value[] | Value
    ): Map<Key, Value[]> {
        const groups: Map<Key, Value[]> = new Map<Key, Value[]>();
        for (let item of array) {
            const key: Key = keySelector(item);
            if (key == null) {
                continue;
            }
            let value: Value[] | Value = valueSelector(item);
            if (value == null) {
                continue;
            }

            if (!(value instanceof Array)) {
                value = [value];
            }

            if (!groups.has(key)) {
                groups.set(key, value);
            } else {
                groups.get(key)?.push(...value);
            }
        }
        return groups;
    }

    public static joinIfDefined(array: any[], join = " "): string {
        return array.filter(val => val).join(join);
    }

    public static uniqueValues<Item, Value>(array: Item[], valueSelector: (item: Item) => Value): Value[] {
        return [...new Set(array.map(valueSelector))];
    }
}

declare global {
    interface Array<T> {
        sum<T>(digits?: number): number;
    }
}

Array.prototype.sum = function(digits = 2) {
    return this.reduce((a, b) => a + b, 0).toFixed(digits);
};
