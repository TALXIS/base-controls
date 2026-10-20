import { useContext, useMemo } from "react";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import { createClientSideRowModelModule, Grid, IGridModule, IGridModules } from "@controls/grid";
import { ITaskGridProps } from "./interfaces";
import { ITaskGridContext, TaskGridContext } from "./context";
import { TaskDatasetControlContext } from "./dataset-control/context";

//what the tree needs of AG Grid; the tree attaches from the TaskDatasetControl
const TREE_AG_GRID_MODULES: IGridModule = { agGridModules: [RowGroupingModule, TreeDataModule] };

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const runtime = useContext(TaskDatasetControlContext);
    if (!runtime) {
        throw new Error('TaskGrid must be rendered inside a TaskDatasetControl.');
    }

    const modules = useMemo((): IGridModules => ({
        ...props.modules,
        rowModel: createClientSideRowModelModule(),
        custom: [TREE_AG_GRID_MODULES, ...runtime.getGridModules(), ...props.modules?.custom ?? []],
    }), []);

    const context = useMemo((): ITaskGridContext => ({ runtime, components: props.components ?? {} }), [props.components]);

    return <TaskGridContext.Provider value={context}>
        <Grid enableZebra={false} enableOptionSetColors {...props} modules={modules} />
    </TaskGridContext.Provider>;
};
