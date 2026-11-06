import { useEffect, useMemo, useState } from "react";
import { IRuntime, IRuntimeEvents, RuntimeLifecycle, useEventEmitter, useLatest, useRerender } from "@core";
import { useOpenErrorDialog } from "@pcf";
import { ErrorMessageBoundary } from "@ui/error-message-bar";
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
    /** Drawn while it initializes too, so it can show its own loading state; reads the runtime with `useRuntime()`. */
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

    useEventEmitter<IRuntimeEvents>(lifecycle.events, STATUS_EVENTS, rerender);
    useEventEmitter<IRuntimeEvents>(lifecycle.events, 'onRemountRequested', () => propsRef.current.onRemount());

    useEffect(() => {
        propsRef.current.onSetup?.(runtime);
        lifecycle.init();
        return () => lifecycle.destroy();
    }, []);

    return <RuntimeContext.Provider value={runtime}>
        <RuntimeStatusContext.Provider value={lifecycle.getStatus()}>
            <ErrorMessageBoundary
                error={lifecycle.getStatus() === 'failed' ? lifecycle.getError() : undefined}
                onRetry={() => lifecycle.remount()}
                onOpenDetails={openErrorDialog}
                components={props.components?.errorMessage}>
                {props.children}
            </ErrorMessageBoundary>
        </RuntimeStatusContext.Provider>
    </RuntimeContext.Provider>;
};
