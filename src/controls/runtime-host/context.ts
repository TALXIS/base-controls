import { createContext, useContext, useEffect, useMemo } from "react";
import type { IRuntime, IRuntimePartMap, IRuntimeParts, RuntimeStatus } from "@core";

export const RuntimeContext = createContext<IRuntime | null>(null);

export const RuntimeStatusContext = createContext<RuntimeStatus | null>(null);

/** The runtime of the nearest `RuntimeHost`; for the control's own mount component only, as hosts nest. */
export const useRuntime = <TRuntime extends IRuntime>(): TRuntime => {
    //read only to re-render the caller when the status changes
    useContext(RuntimeStatusContext);
    const runtime = useContext(RuntimeContext);
    if (!runtime) {
        throw new Error('useRuntime needs a RuntimeHost above it.');
    }
    return runtime as TRuntime;
};

interface IPartsOwner<TMap extends object> {
    readonly parts: IRuntimeParts<TMap>;
}

/** Creates a part once and provides it on the nearest runtime, if any, while the calling component is mounted. */
export function useProvidePart<TName extends keyof IRuntimePartMap, TPart extends IRuntimePartMap[TName]>(name: TName, create: () => TPart): TPart;
/** Creates a part once and provides it on `runtime` while the calling component is mounted. */
export function useProvidePart<TMap extends object, TName extends keyof TMap, TPart extends TMap[TName]>(runtime: IPartsOwner<TMap> | undefined, name: TName, create: () => TPart): TPart;
export function useProvidePart(...args: [string, () => unknown] | [IPartsOwner<any> | undefined, string, () => unknown]): unknown {
    const nearestRuntime = useContext(RuntimeContext) ?? undefined;
    const [runtime, name, create] = args.length === 2 ? [nearestRuntime, ...args] : args;
    //provided as it is made: a part can be read before the first effect, such as the grid before AG Grid mounts
    const [part, remove] = useMemo(() => {
        const created = create();
        return [created, runtime?.parts.provide(name as never, created as never)] as const;
    }, []);
    //a replacing part provides itself before this one unmounts, and the remover leaves it be
    useEffect(() => () => remove?.(), []);
    return part;
}
