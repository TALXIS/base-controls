export const mergeComponentNamespaces = <T extends object>(...sources: (T | undefined)[]): T => {
    const merged: Record<string, object | undefined> = {};
    for (const source of sources) {
        for (const [key, value] of Object.entries<object | undefined>(source ?? {})) {
            merged[key] = { ...merged[key], ...value };
        }
    }
    return merged as T;
};
