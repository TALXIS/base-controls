import { CellSelectionOptions } from "ag-grid-community";
import { CellSelectionModule } from "ag-grid-enterprise";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "../../interfaces";
import { GridCellSelection } from "./GridCellSelection";

/** The cell-range options AG Grid takes, as a caller may set them. */
export type IGridCellSelectionOptions = CellSelectionOptions<IRecord>;

/** Builds the module that lets cells be highlighted by dragging across them. */
export const createCellSelectionModule = (options?: IGridCellSelectionOptions): IGridModule => ({
    agGridModules: [CellSelectionModule],
    onRegister: ({ services }) => {
        new GridCellSelection({ services, options });
    },
});
