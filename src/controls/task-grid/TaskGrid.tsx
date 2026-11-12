import { useMemo } from "react";
import { ClientSideGrid, IGridModule } from "@controls/grid";
import { ITaskGridProps } from "./interfaces";
import { useDatasetControlInternal } from "@controls/dataset-control/adapters/root/context";
import { useTaskRuntime } from "./adapters/root/context";
import { createTaskTreeModule } from "./runtime/tree/createTaskTreeModule";

/** The tasks of a `TaskDatasetControl`, drawn as a tree in its body. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const runtime = useTaskRuntime();
    const datasetControl = useDatasetControlInternal();

    const { defaultExpandedLevel, ...gridProps } = props;
    const modules = useMemo((): IGridModule[] => [createTaskTreeModule(runtime, datasetControl.getViewStateStore(), defaultExpandedLevel), ...props.modules ?? []], []);

    return <ClientSideGrid enableZebra={false} enableOptionSetColors {...gridProps} modules={modules} />;
};
