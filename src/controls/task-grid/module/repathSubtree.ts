import { GridApi } from "ag-grid-community";
import { IRecord } from "@talxis/client-libraries";
import { ITaskDataProvider } from "@controls/task-grid/providers/task";

/** Has AG Grid read the path of a task and its subtasks again, which it does only for rows it is told changed. */
export const repathSubtree = (gridApi: GridApi<IRecord>, taskDataProvider: ITaskDataProvider, recordId: string): void => {
    const record = taskDataProvider.getRecordsMap()[recordId];
    const subtree = [record, ...taskDataProvider.getRecordTree().structure.getDescendants(recordId)];
    //a task the view filters out is not a row
    const rows = subtree.filter(task => task && gridApi.getRowNode(task.getRecordId()));
    if (rows.length) {
        gridApi.applyTransaction({ update: rows });
    }
};
