import { useMemo } from "react";
import { RowGroupingModule, TreeDataModule } from "ag-grid-enterprise";
import { createClientSideRowModelModule, Grid, IGridModule, IGridModules, IGridOpenRecordParams } from "@controls/grid";
import { ITaskGridProps } from "./interfaces";
import { ITaskGridContext, TaskGridContext } from "./context";
import { useTaskRuntime } from "./dataset-control/context";
import { runQuietly } from "./runtime/runQuietly";

//what the tree needs of AG Grid; the tree attaches from the TaskDatasetControl
const TREE_AG_GRID_MODULES: IGridModule = { agGridModules: [RowGroupingModule, TreeDataModule] };

/** The tasks of a `TaskDatasetControl`, drawn as a tree; goes in its body. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const runtime = useTaskRuntime();

    const modules = useMemo((): IGridModules => ({
        ...props.modules,
        rowModel: createClientSideRowModelModule(),
        custom: [TREE_AG_GRID_MODULES, ...runtime.getGridModules(), ...props.modules?.custom ?? []],
    }), []);

    const context = useMemo((): ITaskGridContext => ({ runtime, components: props.components ?? {} }), [props.components]);

    const onOpenRecord = (params: IGridOpenRecordParams) => runQuietly(() => runtime.tasks.open(params.reference, params.columnName));

    return <TaskGridContext.Provider value={context}>
        <Grid enableZebra={false} enableOptionSetColors onOpenRecord={onOpenRecord} {...props} modules={modules} />
    </TaskGridContext.Provider>;
};
