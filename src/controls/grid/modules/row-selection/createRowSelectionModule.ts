import { RowSelectionModule } from "ag-grid-community";
import { ServiceLocator } from "@utils";
import { IGridModule } from "../../interfaces";
import { GridRowSelection } from "./GridRowSelection";
import { IGridRowSelectionServiceMap } from "./services";

export interface IRowSelectionModuleOptions {
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
    /** Called when the selected records change, with the ids now selected. */
    onSelectionChanged?: (selectedRecordIds: string[]) => void;
}

export interface IRowSelectionModule extends IGridModule<'rowSelection'> { }

/** Builds the module that lets rows be selected. */
export const createRowSelectionModule = (options: IRowSelectionModuleOptions): IRowSelectionModule => ({
    name: 'rowSelection',
    agGridModules: [RowSelectionModule],
    onLoad: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridRowSelectionServiceMap>();
        services.register('gridServices', () => gridServices);
        return new GridRowSelection({ services, mode: options.mode, onSelectionChanged: options.onSelectionChanged });
    },
    onDestroy: selection => selection.destroy(),
});
