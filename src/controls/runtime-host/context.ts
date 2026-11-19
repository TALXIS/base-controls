import { createContext, useContext, useEffect, useLayoutEffect, useMemo } from "react";
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

export interface IProvidePartParameters {
    /** Provides the part after the commit, so React components observing it may set state. */
    afterCommit?: boolean;
}

type NearestProvidePartArguments = [string, () => unknown, IProvidePartParameters?];
type ProvidePartArguments = [IPartsOwner<any> | undefined, string, () => unknown, IProvidePartParameters?];

/** Creates a part once and provides it on the nearest runtime, if any, while the calling component is mounted. */
export function useProvidePart<TName extends keyof IRuntimePartMap, TPart extends IRuntimePartMap[TName]>(name: TName, create: () => TPart, parameters?: IProvidePartParameters): TPart;
/** Creates a part once and provides it on `runtime` while the calling component is mounted. */
export function useProvidePart<TMap extends object, TName extends keyof TMap, TPart extends TMap[TName]>(runtime: IPartsOwner<TMap> | undefined, name: TName, create: () => TPart, parameters?: IProvidePartParameters): TPart;
export function useProvidePart(...args: NearestProvidePartArguments | ProvidePartArguments): unknown {
    const nearestRuntime = useContext(RuntimeContext) ?? undefined;
    const [runtime, name, create, parameters]: ProvidePartArguments = typeof args[0] === 'string' ? [nearestRuntime, ...args as NearestProvidePartArguments] : args as ProvidePartArguments;
    const afterCommit = !!parameters?.afterCommit;
    //provided as it is made: a part can be read before the first effect, such as the grid before AG Grid mounts
    const [part, removePart] = useMemo(() => {
        const created = create();
        return [created, afterCommit ? undefined : runtime?.parts.provide(name as never, created as never)] as const;
    }, []);
    useLayoutEffect(() => afterCommit ? runtime?.parts.provide(name as never, part as never) : undefined, []);
    //a replacing part provides itself before this one unmounts, and the remover leaves it be
    useEffect(() => () => removePart?.(), []);
    return part;
}
