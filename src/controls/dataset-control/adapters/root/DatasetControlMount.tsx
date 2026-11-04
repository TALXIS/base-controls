import { useTheme } from "@theme";
import { Fragment, useEffect, useMemo } from "react";

import { useEventEmitter, useLatest, useRerender, useLabelsService, useOpenErrorDialog } from "@core";
import { DataProviderContext } from "@data";
import { ErrorMessageBoundary } from "@ui";
import { DatasetControlRuntime, IDatasetControlEvents } from "../../runtime";
import type { DatasetControlState } from "../../runtime/DatasetControlState";
import { DatasetControlRuntimeContext } from "./context";
import { DatasetControlUi } from "../../ui";
import { Skeleton } from "../skeleton/Skeleton";
import { Surfaces } from "../surfaces/Surfaces";
import { LoadingOverlay } from "../loading-overlay";
import type { IDatasetControlProps } from "./Root";
import { DatasetControl } from "../../namespace";

const LOAD_EVENTS: (keyof IDatasetControlEvents)[] = ['onLoadStarted', 'onLoaded', 'onLoadFailed'];

export interface IDatasetControlMountProps extends IDatasetControlProps {
    state: DatasetControlState;
    onRemount: () => void;
}

/** One mount of the control: its runtime, its one load and the parts on it. */
export const DatasetControlMount = (props: IDatasetControlMountProps) => {
    const propsRef = useLatest(props);
    const labelsServiceRef = useLatest(useLabelsService());
    const theme = useTheme();
    const runtime = useMemo(() => new DatasetControlRuntime({
        onGetProps: () => propsRef.current,
        state: props.state,
        onGetLabelsService: () => labelsServiceRef.current,
        theme,
        onRemount: () => propsRef.current.onRemount(),
    }), []);
    const { rerender } = useRerender();
    const openErrorDialog = useOpenErrorDialog();

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
                        <ErrorMessageBoundary
                            error={runtime.getError()}
                            onRetry={() => runtime.retry()}
                            onOpenDetails={openErrorDialog}
                            components={errorMessage}>
                            <Skeleton components={skeleton}>
                                {props.children}
                                <Surfaces />
                            </Skeleton>
                        </ErrorMessageBoundary>
                    </LoadingOverlay>
                </DatasetControlUi.Container>
            </Scope>
        </DataProviderContext.Provider>
    </DatasetControlRuntimeContext.Provider>;
};
