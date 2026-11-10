import { DataProviderContext } from "@data";
import { useRuntime } from "@controls/runtime-host";
import type { DatasetControlRuntime } from "../../runtime";
import { DatasetControlContext } from "./context";
import { DatasetControlUi } from "../../ui";
import { Surfaces } from "../surfaces/Surfaces";
import type { IDatasetControlProps } from "./Root";

/** One mount of the control: the parts, drawn on that mount's ready runtime. */
export const DatasetControlMount = (props: IDatasetControlProps) => {
    const runtime = useRuntime<DatasetControlRuntime>();

    const { container: hostContainer, mountError, skeleton, loadingOverlay, executeError, ...container } = props.components ?? {};

    return <DatasetControlContext.Provider value={runtime}>
        <DataProviderContext.Provider value={runtime.getProvider() ?? null}>
            <DatasetControlUi.Container height={props.height} className={props.className} components={container}>
                {props.children}
                <Surfaces />
            </DatasetControlUi.Container>
        </DataProviderContext.Provider>
    </DatasetControlContext.Provider>;
};
