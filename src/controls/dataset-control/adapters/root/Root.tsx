import { useMemo } from "react";
import { StateStore, useLatest, useStateStore } from "@core";
import { useLabelsService } from "@labels";
import { useTheme } from "@theme";
import { RuntimeHost } from "@controls/runtime-host";
import { DatasetControlRuntime, IDatasetControl, IDatasetControlLoadResult, IDatasetControlModule } from "../../runtime";
import { DatasetControlState } from "../../runtime/DatasetControlState";
import { IDatasetControlComponents } from "./components";
import { DatasetControlMount } from "./DatasetControlMount";

/** Props for `DatasetControl`. */
export interface IDatasetControlProps<TData = unknown> {
    /** The control's modules; read on every mount. */
    modules?: IDatasetControlModule[];
    /** Creates the provider and lists the views, behind the skeleton; called on every mount. */
    onLoad: (control: IDatasetControl<TData>) => Promise<IDatasetControlLoadResult<TData>>;
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
    /** A stable component wrapping each mount's content, rendered before its load. */
    scope?: React.ComponentType<{ children: React.ReactNode }>;
    /** Called with the control of each mount, before its init; subscribe to its events here. */
    onSetup?: (control: IDatasetControl<TData>) => void;
}

/** Loads the provider and holds every part of the control; every load mounts it anew. */
export const Root = <TData,>(props: IDatasetControlProps<TData>) => {
    const stateStore = useStateStore();
    //outlives every runtime: the next mount opens the view and state this one leaves
    const state = useMemo(() => new DatasetControlState({ store: props.stateKey ? stateStore.scope(props.stateKey) : new StateStore() }), []);
    const propsRef = useLatest(props as IDatasetControlProps);
    const labelsServiceRef = useLatest(useLabelsService());
    const theme = useTheme();

    const onCreate = () => new DatasetControlRuntime({
        onGetProps: () => propsRef.current,
        state,
        onGetLabelsService: () => labelsServiceRef.current,
        theme,
    });

    return <RuntimeHost<DatasetControlRuntime> onCreate={onCreate} onSetup={runtime => propsRef.current.onSetup?.(runtime)} components={{ errorMessage: props.components?.errorMessage }}>
        {/* the mount never reads view data */}
        <DatasetControlMount {...props as IDatasetControlProps} />
    </RuntimeHost>;
};
