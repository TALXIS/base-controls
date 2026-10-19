import { RowDragModule } from "ag-grid-community";
import type { IGridModule } from "@controls/grid";
import type { ITaskGridServiceMap } from "../services";
import { TaskTreeDragging } from "./TaskTreeDragging";

/** Moves tasks by dragging their rows: between rows, sideways between levels, or onto another task; not in a flat list. */
export const createTaskDraggingModule = (): IGridModule<ITaskGridServiceMap> => ({
    agGridModules: [RowDragModule],
    onRegister: grid => {
        new TaskTreeDragging({ grid, onIsEnabled: () => !grid.services.get('taskTree').isFlatList() });
    },
});
