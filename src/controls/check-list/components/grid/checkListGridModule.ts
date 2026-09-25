import { IRowDragItem } from "@ag-grid-community/core";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "@controls/grid";
import { ICheckListDatasetControl } from "../../CheckListDatasetControl";
import { CheckListGridCustomizer } from "./grid-customizer";

/** The checklist's drag label, row transition and customizer, set up on the grid. */
export const createCheckListGridModule = (datasetControl: ICheckListDatasetControl, className: string): IGridModule => {
    //without it the drag ghost reads "1 row"; the item's own label is more use
    const rowDragText = (params: IRowDragItem) => {
        const record = params.rowNode?.data as IRecord | undefined;
        return record?.getFormattedValue(datasetControl.getFieldMapping().name) ?? '';
    };
    return {
        onRegister: services => {
            services.get('grid').registerAgGridInitialOptions(result => {
                result.options.rowDragText = rowDragText;
                //the grid's own root is not where the row transition can live: this one lands on the
                //ag-root-wrapper, above the animated rows
                result.options.className = className;
            });
            //ahead of the grid's first column push, so those columns arrive through the patched setter
            services.whenAvailable('gridApi', gridApi => new CheckListGridCustomizer({ gridApi, datasetControl }));
        },
    };
};
