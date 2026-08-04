export function notImplemented(name: string): never {
    throw new Error(`[XrmFactory] ${name} is not implemented.`);
}
