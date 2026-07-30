export function notImplemented(name: string): never {
    throw new Error(`[XrmFormContext] ${name} is not implemented.`);
}

export function isPromiseLike<T>(value: T | PromiseLike<T>): value is PromiseLike<T> {
    return typeof value === "object" && value !== null && "then" in value;
}
