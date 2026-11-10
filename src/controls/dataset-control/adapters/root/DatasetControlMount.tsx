import { DataProviderContext } from "@data";
import { useRuntime } from "@controls/runtime-host";
import type { DatasetControlRuntime } from "../../runtime";
import { DatasetControlContext } from "./context";
import { Surfaces } from "../surfaces/Surfaces";
import type { IDatasetControlProps } from "./Root";

/** One mount of the control: the parts, drawn on that mount's ready runtime. */
export const DatasetControlMount = (props: IDatasetControlProps) => {
    const runtime = useRuntime<DatasetControlRuntime>();

    return <DatasetControlContext.Provider value={runtime}>
        <DataProviderContext.Provider value={runtime.getProvider() ?? null}>
            {props.children}
            <Surfaces />
        </DataProviderContext.Provider>
    </DatasetControlContext.Provider>;
};
