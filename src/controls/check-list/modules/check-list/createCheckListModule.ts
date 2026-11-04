import { PinnedRowModule, RowDragModule } from "ag-grid-community";
import { IGridModule } from "../../grid/interfaces";
import { GridCheckList, ICheckListFieldMapping } from "./GridCheckList";

export interface ICheckListModuleOptions {
    fieldMapping: ICheckListFieldMapping;
}

export interface ICheckListModule extends IGridModule<'checkList'> { }

/** Builds the module that makes a grid on the client-side row model a checklist. */
export const createCheckListModule = (options: ICheckListModuleOptions): ICheckListModule => ({
    name: 'checkList',
    agGridModules: [RowDragModule, PinnedRowModule],
    onLoad: grid => new GridCheckList({ grid, fieldMapping: options.fieldMapping }),
    onDestroy: checkList => checkList.destroy(),
});
