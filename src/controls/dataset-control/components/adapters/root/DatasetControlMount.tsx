import { Fragment, useEffect, useMemo } from "react";
import { useEventEmitter, useLatest } from "@hooks";
import { useRerender } from "@legacy";
import { DataProviderContext, ErrorBoundary } from "@utils";
import { DatasetControlRuntime, IDatasetControlEvents } from "../../../runtime";
import type { DatasetControlState } from "../../../runtime/DatasetControlState";
import { DatasetControlRuntimeContext } from "./context";
import { DatasetControlUi } from "../../ui";
import { Skeleton } from "../skeleton/Skeleton";
import { Surfaces } from "../surfaces/Surfaces";
import { LoadingOverlay } from "../loading-overlay";
import type { IDatasetControlProps } from "./Root";
import { DatasetControl } from "@controls/dataset-control/namespace";

const LOAD_EVENTS: (keyof IDatasetControlEvents)[] = ['onLoadStarted', 'onLoaded', 'onLoadFailed'];

export interface IDatasetControlMountProps extends IDatasetControlProps {
    state: DatasetControlState;
    onRemount: () => void;
}

/** One mount of the control: its runtime, its one load and the parts on it. */
export const DatasetControlMount = (props: IDatasetControlMountProps) => {
    const propsRef = useLatest(props);
    const runtime = useMemo(() => new DatasetControlRuntime({
        onGetProps: () => propsRef.current,
        state: props.state,
        onRemount: () => propsRef.current.onRemount(),
    }), []);
    const { rerender } = useRerender();

    useEventEmitter<IDatasetControlEvents>(runtime.events, LOAD_EVENTS, rerender);
    useEventEmitter<IDatasetControlEvents>(runtime.events, 'onLoaded', () => propsRef.current.onReady?.(runtime));

    useEffect(() => {
        propsRef.current.onMounted?.(runtime);
        runtime.load();
        return () => {
            propsRef.current.onDestroyed?.(runtime);
            runtime.destroy();
        };
    }, []);

    const { errorMessage, skeleton, loadingOverlay, ...container } = props.components ?? {};
    const Scope = props.scope ?? Fragment;

    return <DatasetControlRuntimeContext.Provider value={runtime}>
        <DataProviderContext.Provider value={runtime.getProvider() ?? null}>
            <Scope>
                <DatasetControlUi.Container height={props.height} className={props.className} components={container}>
                    <LoadingOverlay components={loadingOverlay}>
                        <ErrorBoundary
                            error={runtime.getError()}
                            onRetry={() => runtime.retry()}
                            components={errorMessage}>
                            <Skeleton components={skeleton}>
                                {props.children}
                                <Surfaces />
                            </Skeleton>
                        </ErrorBoundary>
                    </LoadingOverlay>
                </DatasetControlUi.Container>
            </Scope>
        </DataProviderContext.Provider>
    </DatasetControlRuntimeContext.Provider>;
};
