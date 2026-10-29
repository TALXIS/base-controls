import { useMemo, useState } from "react";
import { StateStore, useStateStore } from "@utils";
import { IDatasetControl, IDatasetControlLoadParameters, IDatasetControlLoadResult, IDatasetControlModule, IDatasetControlView } from "../../../runtime";
import { DatasetControlState } from "../../../runtime/DatasetControlState";
import { IDatasetControlLabels } from "./labels";
import { IDatasetControlComponents } from "./components";
import { DatasetControlMount } from "./DatasetControlMount";

/** Props for `DatasetControl`. */
export interface IDatasetControlProps<TData = unknown> {
    /** Loads what the modules and `onLoad` read through `getDependencies()`; awaited first on every mount. */
    onLoadDependencies?: () => Promise<unknown>;
    /** The control's modules; read on every mount. */
    modules?: IDatasetControlModule[];
    /** The views to switch between; called before `onLoad` on every mount. */
    onLoadViews?: () => Promise<IDatasetControlView<TData>[]>;
    /** Loads the provider for the view the control resolved, behind the skeleton; called on every mount. */
    onLoad: (parameters: IDatasetControlLoadParameters<TData>) => Promise<IDatasetControlLoadResult>;
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
    /** A stable component wrapping each mount's content, rendered before its load. */
    scope?: React.ComponentType<{ children: React.ReactNode }>;
    /** Called on every mount once the control exists, before its load; subscribe to its events here. */
    onMounted?: (control: IDatasetControl<TData>) => void;
    /** Called on every mount once its load succeeded. */
    onReady?: (control: IDatasetControl<TData>) => void;
    /** Called as each mount goes, while its provider still holds its data. */
    onDestroyed?: (control: IDatasetControl<TData>) => void;
}

/** Loads the provider and holds every part of the control; every load mounts it anew. */
export const Root = <TData,>(props: IDatasetControlProps<TData>) => {
    const stateStore = useStateStore();
    props.
    const state = useMemo(() => new DatasetControlState({ store: props.stateKey ? stateStore.scope(props.stateKey) : new StateStore() }), []);
    //React keys can't be symbols
    const [mountKey, setMountKey] = useState(() => crypto.randomUUID());

    //the mount never reads view data
    return <DatasetControlMount key={mountKey} {...props as IDatasetControlProps} state={state} onRemount={() => setMountKey(crypto.randomUUID())} />;
};
