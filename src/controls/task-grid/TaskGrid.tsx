import { useMemo } from "react";
import { ClientSideGrid, IGridModule } from "@controls/grid";
import { ITaskGridProps } from "./interfaces";
import { ITaskGridContext, TaskGridContext } from "./context";
import { useDatasetControlInternal } from "@controls/dataset-control/adapters/root/context";
import { useTaskRuntime } from "./adapters/root/context";
import { createTaskTreeModule } from "./runtime/tree/createTaskTreeModule";

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const runtime = useTaskRuntime();
    const datasetControl = useDatasetControlInternal();

    const modules = useMemo((): IGridModule[] => [createTaskTreeModule(runtime, datasetControl.getViewStateStore()), ...props.modules ?? []], []);

    const context = useMemo((): ITaskGridContext => ({ components: props.components ?? {} }), [props.components]);

    return <TaskGridContext.Provider value={context}>
        <ClientSideGrid enableZebra={false} enableOptionSetColors {...props} modules={modules} />
    </TaskGridContext.Provider>;
};
