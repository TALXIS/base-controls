import { useMemo } from "react";
import type { ILoadingBoundaryComponents } from "@ui/loading-boundary";
import { useControlStateStore, useLatest } from "@core";
import { useLabelsService } from "@labels";
import { useTheme } from "@theme";
import { RuntimeHost } from "@controls/runtime-host";
import { DatasetControlRuntime, IDatasetControl, IDatasetControlLoadResult, IDatasetControlModule } from "../../runtime";
import { DatasetControlState } from "../../runtime/DatasetControlState";
import { IDatasetControlComponents } from "./components";
import { DatasetControlMount } from "./DatasetControlMount";
import { DatasetControlUi } from "../../ui";

/** Props for `DatasetControl`. */
export interface IDatasetControlProps<TData = unknown> {
    /** The control's modules; read on every mount. */
    modules?: IDatasetControlModule[];
    /** Creates the provider and lists the views, behind the skeleton; called on every mount. */
    onLoad: (control: IDatasetControl<TData>) => IDatasetControlLoadResult<TData> | Promise<IDatasetControlLoadResult<TData>>;
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
    /** Replacements for the box, the skeleton and the error. */
    components?: IDatasetControlComponents;
    /** Called with the control of each mount, before its init; subscribe to its events here. */
    onSetup?: (control: IDatasetControl<TData>) => void;
}

/** Loads the provider and holds every part of the control; every load mounts it anew. */
export const Root = <TData,>(props: IDatasetControlProps<TData>) => {
    const store = useControlStateStore(props.stateKey);
    //outlives every runtime: the next mount opens the view and state this one leaves
    const state = useMemo(() => new DatasetControlState({ store }), []);
    const propsRef = useLatest(props as IDatasetControlProps);
    const labelsServiceRef = useLatest(useLabelsService());
    const theme = useTheme();

    const createRuntime = () => new DatasetControlRuntime({
        getProps: () => propsRef.current,
        state,
        getLabelsService: () => labelsServiceRef.current,
        theme,
    });

    const { errorMessage, skeleton, loadingOverlay, ...container } = props.components ?? {};
    const loading: Partial<ILoadingBoundaryComponents> = {
        onRenderContainer: () => <DatasetControlUi.Container height={props.height} className={props.className} components={container}>
            <DatasetControlUi.Skeleton height={props.height} components={skeleton} />
        </DatasetControlUi.Container>,
    };

    return <RuntimeHost<DatasetControlRuntime> createRuntime={createRuntime} onSetup={runtime => propsRef.current.onSetup?.(runtime)} components={{ errorMessage, loading }}>
        {/* the mount never reads view data */}
        <DatasetControlMount {...props as IDatasetControlProps} />
    </RuntimeHost>;
};
