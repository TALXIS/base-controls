import { useMemo, useState } from "react";
import { StateStore, useStateStore } from "@utils";
import { IDatasetControl, IDatasetControlLoadParameters, IDatasetControlLoadResult } from "../../../runtime";
import { DatasetControlState } from "../../../runtime/DatasetControlState";
import { IDatasetControlLabels } from "./labels";
import { IDatasetControlComponents } from "./components";
import { DatasetControlMount } from "./DatasetControlMount";

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
    /** Called on every mount, before its load; a view switch, reload or retry mounts the control anew. */
    onReady?: (control: IDatasetControl) => void;
    /** Called as each mount goes, while its provider still holds its data. */
    onDestroyed?: (control: IDatasetControl) => void;
}

/** Loads the provider and holds every part of the control; every load mounts it anew. */
export const Root = (props: IDatasetControlProps) => {
    const stateStore = useStateStore();
    const state = useMemo(() => new DatasetControlState({ store: props.stateKey ? stateStore.scope(props.stateKey) : new StateStore() }), []);
    //React keys can't be symbols
    const [mountKey, setMountKey] = useState(() => crypto.randomUUID());

    return <DatasetControlMount key={mountKey} {...props} state={state} onRemount={() => setMountKey(crypto.randomUUID())} />;
};
