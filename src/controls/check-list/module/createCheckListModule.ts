import { PinnedRowModule, RowDragModule } from "ag-grid-community";
import { IGridModule } from "../../grid/interfaces";
import { ICheckListLabels } from "../labels";
import { GridCheckList, ICheckListFieldMapping, ICheckListServiceMap } from "./GridCheckList";

export interface ICheckListModuleOptions {
    fieldMapping: ICheckListFieldMapping;
    /** Overrides for the checklist's own strings. */
    labels?: Partial<ICheckListLabels>;
}

/** Builds the module that makes a grid on the client-side row model a checklist. */
export const createCheckListModule = (options: ICheckListModuleOptions): IGridModule<ICheckListServiceMap> => ({
    agGridModules: [RowDragModule, PinnedRowModule],
    onRegister: grid => {
        const checkList = new GridCheckList({ grid, fieldMapping: options.fieldMapping, labels: options.labels });
        grid.services.register('checkList', () => checkList);
    },
});
