import { useMemo } from "react";
import { createClientSideRowModelModule, Grid, IGridModules } from "@controls/grid";
import { createTaskTreeModule } from "./tree/createTaskTreeModule";
import { ITaskGridProps } from "./interfaces";
import { ITaskGridContext, TaskGridContext } from "./context";
import { useTaskDatasetControl } from "./dataset-control/context";

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const runtime = useTaskDatasetControl();

    const modules = useMemo((): IGridModules => ({
        ...props.modules,
        rowModel: createClientSideRowModelModule(),
        custom: [createTaskTreeModule({ runtime }), ...props.modules?.custom ?? []],
    }), []);

    const context = useMemo((): ITaskGridContext => ({ runtime, components: props.components ?? {} }), [props.components]);

    return <TaskGridContext.Provider value={context}>
        <Grid enableZebra={false} {...props} modules={modules} />
    </TaskGridContext.Provider>;
};
