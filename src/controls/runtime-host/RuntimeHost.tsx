import { useLayoutEffect, useMemo, useState } from "react";
import { IRuntime, IRuntimeEvents, RuntimeLifecycle, useEventEmitter, useLatest, useRerender } from "@core";
import { useOpenErrorDialog } from "@pcf";
import { ErrorMessageBoundary } from "@ui/error-message-bar";
import { LoadingBoundary } from "@ui/loading-boundary";
import { RuntimeContext, RuntimeStatusContext } from "./context";
import { IRuntimeHostComponents } from "./components";

/** What the host runs: a runtime that owns a lifecycle. */
export interface IHostedRuntime extends IRuntime {
    /** This mount's lifecycle, which the host drives. */
    readonly lifecycle: RuntimeLifecycle;
}

export interface IRuntimeHostProps<TRuntime extends IHostedRuntime> {
    /** Creates the runtime of one mount; called again on every remount. */
    onCreate: () => TRuntime;
    /** Called with each new runtime, before its init; subscribe to its events here. */
    onSetup?: (runtime: TRuntime) => void;
    /** Rendered once the runtime is ready; reads it with `useRuntime()`. */
    children?: React.ReactNode;
    /** Replacements for what the host draws itself. */
    components?: Partial<IRuntimeHostComponents>;
}

const STATUS_EVENTS: (keyof IRuntimeEvents)[] = ['onReady', 'onInitFailed'];

/** One runtime per mount: creates it, drives its lifecycle, shows a failed init with a retry, and makes a new one on remount. */
export const RuntimeHost = <TRuntime extends IHostedRuntime>(props: IRuntimeHostProps<TRuntime>) => {
    const [mountKey, setMountKey] = useState(0);
    return <RuntimeMount key={mountKey} {...props} onRemount={() => setMountKey(key => key + 1)} />;
};

const RuntimeMount = <TRuntime extends IHostedRuntime>(props: IRuntimeHostProps<TRuntime> & { onRemount: () => void }) => {
    const propsRef = useLatest(props);
    const runtime = useMemo(() => props.onCreate(), []);
    const { lifecycle } = runtime;
    const { rerender } = useRerender();
    const openErrorDialog = useOpenErrorDialog();

    //subscribed in the commit, before the init below starts
    useEventEmitter<IRuntimeEvents>(lifecycle.events, STATUS_EVENTS, rerender);
    useEventEmitter<IRuntimeEvents>(lifecycle.events, 'onRemountRequested', () => propsRef.current.onRemount());

    //before the paint, so a runtime that loads without waiting is drawn ready
    useLayoutEffect(() => {
        propsRef.current.onSetup?.(runtime);
        lifecycle.init();
        return () => lifecycle.destroy();
    }, []);

    const status = lifecycle.getStatus();

    return <RuntimeContext.Provider value={runtime}>
        <RuntimeStatusContext.Provider value={status}>
            <ErrorMessageBoundary
                error={status === 'failed' ? lifecycle.getError() : undefined}
                onRetry={() => lifecycle.remount()}
                onOpenDetails={openErrorDialog}
                components={props.components?.errorMessage}>
                <LoadingBoundary isLoading={status === 'initializing'} components={props.components?.loading}>
                    {props.children}
                </LoadingBoundary>
            </ErrorMessageBoundary>
        </RuntimeStatusContext.Provider>
    </RuntimeContext.Provider>;
};
