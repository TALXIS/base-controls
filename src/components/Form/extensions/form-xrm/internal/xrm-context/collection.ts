export function makeItemCollection<T>(items: T[], getNameFn: (item: T) => string): Xrm.Collection.ItemCollection<T> {
    return {
        get: (selectorOrIndex?: string | number | ((item: T, index: number) => boolean)) => {
            if (selectorOrIndex === undefined || selectorOrIndex === null) {
                return items as any;
            }
            if (typeof selectorOrIndex === "string") {
                return (items.find((i) => getNameFn(i) === selectorOrIndex) ?? null) as any;
            }
            if (typeof selectorOrIndex === "number") {
                return (items[selectorOrIndex] ?? null) as any;
            }
            if (typeof selectorOrIndex === "function") {
                return items.filter(selectorOrIndex) as any;
            }
            return null as any;
        },
        getLength: () => items.length,
        forEach: (cb: (item: T, index: number) => void) => {
            items.forEach((item, idx) => cb(item, idx));
        },
    } as any;
}
