import { useEffect, useMemo } from "react";
import { useEventEmitter, useLatest } from "@hooks";
import { useRerender } from "@legacy";
import { DataProviderContext, ErrorBoundary, useStateStore } from "@utils";
import { DatasetControlRuntime, IDatasetControl, IDatasetControlEvents, IDatasetControlLoadParameters, IDatasetControlLoadResult } from "../../../runtime";
import { DatasetControlRuntimeContext } from "./context";
import { IDatasetControlLabels } from "./labels";
import { IDatasetControlComponents } from "./components";
import { DatasetControlUi } from "../../ui";
import { Skeleton } from "../skeleton/Skeleton";

const LOAD_EVENTS: (keyof IDatasetControlEvents)[] = ['onLoadStarted', 'onLoaded', 'onLoadFailed'];

/** Props for `DatasetControl`. */
export interface IDatasetControlProps {
    /** Loads the provider for the view and whatever it needs, behind the skeleton; called at mount and on every view switch. */
    onLoad: (parameters: IDatasetControlLoadParameters) => Promise<IDatasetControlLoadResult>;
    /** The parts, laid out in its header, body and footer. */
    children: React.ReactNode;
    /** `'100%'` fills the parent; the content's height when left out. */
    height?: string;
    /** Added to the control's box. */
    className?: string;
    /** The key the control's state is kept under in the state store. */
    stateKey?: string;
    /** Whether the control destroys the providers it lets go of, on unmount and reload; defaults to `true`. */
    destroyProviderOnUnmount?: boolean;
    /** Read once, at mount. */
    labels?: Partial<IDatasetControlLabels>;
    /** Replacements for the box, the skeleton and the error. */
    components?: IDatasetControlComponents;
    /** Called once the control exists, before the first load. */
    onReady?: (control: IDatasetControl) => void;
    /** Called as the control unmounts, while its provider still holds its data. */
    onDestroyed?: (control: IDatasetControl) => void;
}

/** Loads the provider and holds every part of the control. */
export const Root = (props: IDatasetControlProps) => {
    const stateStore = useStateStore();
    const propsRef = useLatest(props);
    const runtime = useMemo(() => new DatasetControlRuntime({ onGetProps: () => propsRef.current, stateStore }), []);
    const { rerender } = useRerender();

    useEventEmitter<IDatasetControlEvents>(runtime.events, LOAD_EVENTS, rerender);

    useEffect(() => {
        propsRef.current.onReady?.(runtime);
        runtime.load();
        return () => {
            propsRef.current.onDestroyed?.(runtime);
            runtime.destroy();
        };
    }, []);

    const { errorMessage, skeleton, ...container } = props.components ?? {};

    return <DatasetControlRuntimeContext.Provider value={runtime}>
        <DataProviderContext.Provider value={runtime.getProvider() ?? null}>
            <DatasetControlUi.Container height={props.height} className={props.className} components={container}>
                <ErrorBoundary
                    error={runtime.getError()}
                    onRetry={() => runtime.retry()}
                    components={errorMessage}>
                    {/* a new provider mounts the parts anew */}
                    <Skeleton key={runtime.getProviderKey()} components={skeleton}>
                        {props.children}
                    </Skeleton>
                </ErrorBoundary>
            </DatasetControlUi.Container>
        </DataProviderContext.Provider>
    </DatasetControlRuntimeContext.Provider>;
};
