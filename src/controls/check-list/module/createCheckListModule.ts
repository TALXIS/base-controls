import { PinnedRowModule, RowDragModule } from "ag-grid-community";
import { IGridModule } from "../../grid/interfaces";
import { ICheckListLabels } from "../labels";
import { GridCheckList, ICheckListFieldMapping } from "./GridCheckList";

export interface ICheckListModuleOptions {
    fieldMapping: ICheckListFieldMapping;
    /** Overrides for the checklist's own strings. */
    labels?: Partial<ICheckListLabels>;
}

export interface ICheckListModule extends IGridModule<'checkList'> { }

/** Builds the module that makes a grid on the client-side row model a checklist. */
export const createCheckListModule = (options: ICheckListModuleOptions): ICheckListModule => ({
    name: 'checkList',
    agGridModules: [RowDragModule, PinnedRowModule],
    onLoad: grid => new GridCheckList({ grid, fieldMapping: options.fieldMapping, labels: options.labels }),
    onDestroy: checkList => checkList.destroy(),
});
