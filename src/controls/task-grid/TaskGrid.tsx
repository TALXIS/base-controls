import { useMemo } from "react";
import { createClientSideRowModelModule, Grid, IGridModule, IGridOpenRecordParams } from "@controls/grid";
import { ITaskGridProps } from "./interfaces";
import { ITaskGridContext, TaskGridContext } from "./context";
import { useRequiredDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root/context";
import { useTaskRuntime } from "./dataset-control/context";
import { runQuietly } from "./runtime/runQuietly";
import { createTaskTreeModule } from "./tree/createTaskTreeModule";

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const runtime = useTaskRuntime();
    const datasetControl = useRequiredDatasetControlRuntime();

    const modules = useMemo((): IGridModule[] => [createClientSideRowModelModule(), createTaskTreeModule(runtime, datasetControl.getViewStateStore()), ...props.modules ?? []], []);

    const context = useMemo((): ITaskGridContext => ({ runtime, components: props.components ?? {} }), [props.components]);

    const onOpenRecord = (params: IGridOpenRecordParams) => runQuietly(() => runtime.tasks.openRecord(params.reference, params.columnName));

    return <TaskGridContext.Provider value={context}>
        <Grid enableZebra={false} enableOptionSetColors onOpenRecord={onOpenRecord} {...props} modules={modules} />
    </TaskGridContext.Provider>;
};
