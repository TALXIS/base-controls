import { Fragment } from "react";
import { DataProviderContext } from "@data";
import { useRuntime } from "@controls/runtime-host";
import type { DatasetControlRuntime } from "../../runtime";
import { DatasetControlRuntimeContext } from "./context";
import { DatasetControlUi } from "../../ui";
import { Skeleton } from "../skeleton/Skeleton";
import { Surfaces } from "../surfaces/Surfaces";
import { LoadingOverlay } from "../loading-overlay";
import type { IDatasetControlProps } from "./Root";

/** One mount of the control: the parts, drawn on that mount's runtime. */
export const DatasetControlMount = (props: IDatasetControlProps) => {
    const runtime = useRuntime<DatasetControlRuntime>();

    const { errorMessage, skeleton, loadingOverlay, ...container } = props.components ?? {};
    const Scope = props.scope ?? Fragment;

    return <DatasetControlRuntimeContext.Provider value={runtime}>
        <DataProviderContext.Provider value={runtime.getProvider() ?? null}>
            <Scope>
                <DatasetControlUi.Container height={props.height} className={props.className} components={container}>
                    <LoadingOverlay components={loadingOverlay}>
                        <Skeleton components={skeleton}>
                            {props.children}
                            <Surfaces />
                        </Skeleton>
                    </LoadingOverlay>
                </DatasetControlUi.Container>
            </Scope>
        </DataProviderContext.Provider>
    </DatasetControlRuntimeContext.Provider>;
};
