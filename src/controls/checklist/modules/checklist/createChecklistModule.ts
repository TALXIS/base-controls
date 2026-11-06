import { PinnedRowModule, RowDragModule } from "ag-grid-community";
import { IGridModule } from "@controls/grid";
import { GridChecklist, IChecklistFieldMapping } from "./GridChecklist";

export interface IChecklistModuleParameters {
    fieldMapping: IChecklistFieldMapping;
}

export interface IChecklistModule extends IGridModule<'checklist'> { }

/** Builds the module that makes a grid on the client-side row model a checklist. */
export const createChecklistModule = (parameters: IChecklistModuleParameters): IChecklistModule => ({
    name: 'checklist',
    //after the grid's other modules: it checks for editing as it loads
    priority: 100,
    agGridModules: [RowDragModule, PinnedRowModule],
    onLoad: grid => new GridChecklist({ grid, fieldMapping: parameters.fieldMapping }),
    onDestroy: checkList => checkList.destroy(),
});
