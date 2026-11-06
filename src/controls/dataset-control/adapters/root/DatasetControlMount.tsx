import { DataProviderContext } from "@data";
import { useRuntime } from "@controls/runtime-host";
import type { DatasetControlRuntime } from "../../runtime";
import { DatasetControlRuntimeContext } from "./context";
import { DatasetControlUi } from "../../ui";
import { Surfaces } from "../surfaces/Surfaces";
import { LoadingOverlay } from "../loading-overlay";
import type { IDatasetControlProps } from "./Root";

/** One mount of the control: the parts, drawn on that mount's ready runtime. */
export const DatasetControlMount = (props: IDatasetControlProps) => {
    const runtime = useRuntime<DatasetControlRuntime>();

    const { errorMessage, skeleton, loadingOverlay, ...container } = props.components ?? {};

    return <DatasetControlRuntimeContext.Provider value={runtime}>
        <DataProviderContext.Provider value={runtime.getProvider() ?? null}>
            <DatasetControlUi.Container height={props.height} className={props.className} components={container}>
                <LoadingOverlay components={loadingOverlay}>
                    {props.children}
                    <Surfaces />
                </LoadingOverlay>
            </DatasetControlUi.Container>
        </DataProviderContext.Provider>
    </DatasetControlRuntimeContext.Provider>;
};
