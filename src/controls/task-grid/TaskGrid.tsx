import { useMemo } from "react";
import { createClientSideRowModelModule, Grid, IGridModule, IGridOpenRecordParameters } from "@controls/grid";
import { ITaskGridProps } from "./interfaces";
import { ITaskGridContext, TaskGridContext } from "./context";
import { useDatasetControlInternal } from "@controls/dataset-control/adapters/root/context";
import { useTaskRuntime } from "./adapters/root/context";
import { runQuietly } from "./runtime/runQuietly";
import { createTaskTreeModule } from "./runtime/tree/createTaskTreeModule";

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const runtime = useTaskRuntime();
    const datasetControl = useDatasetControlInternal();

    const modules = useMemo((): IGridModule[] => [createClientSideRowModelModule(), createTaskTreeModule(runtime, datasetControl.getViewStateStore()), ...props.modules ?? []], []);

    const context = useMemo((): ITaskGridContext => ({ components: props.components ?? {} }), [props.components]);

    const onOpenRecord = (parameters: IGridOpenRecordParameters) => runQuietly(() => runtime.tasks.openRecord(parameters.reference, parameters.columnName));

    return <TaskGridContext.Provider value={context}>
        <Grid enableZebra={false} enableOptionSetColors onOpenRecord={onOpenRecord} {...props} modules={modules} />
    </TaskGridContext.Provider>;
};
