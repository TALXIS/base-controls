export function notImplemented(name: string): never {
    throw new Error(`[PcfContextFactory] ${name} is not implemented.`);
}
