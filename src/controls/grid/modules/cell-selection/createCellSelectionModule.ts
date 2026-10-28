import { CellSelectionOptions } from "ag-grid-community";
import { CellSelectionModule } from "ag-grid-enterprise";
import { IRecord } from "@talxis/client-libraries";
import { IGridModule } from "../../interfaces";
import { GridCellSelection } from "./GridCellSelection";

/** The cell-range options AG Grid takes, as a caller may set them. */
export type IGridCellSelectionOptions = CellSelectionOptions<IRecord>;

export interface ICellSelectionModule extends IGridModule<'cellSelection'> { }

declare module "../../interfaces" {
    interface IGridModuleMap {
        /** Highlighting cells by dragging across them. */
        cellSelection: GridCellSelection;
    }
}

/** Builds the module that lets cells be highlighted by dragging across them. */
export const createCellSelectionModule = (options?: IGridCellSelectionOptions): ICellSelectionModule => ({
    name: 'cellSelection',
    agGridModules: [CellSelectionModule],
    onLoad: ({ services }) => new GridCellSelection({ services, options }),
});
