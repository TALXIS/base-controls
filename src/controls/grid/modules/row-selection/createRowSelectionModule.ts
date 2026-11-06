import { RowSelectionModule } from "ag-grid-community";
import { ServiceRegistry } from "@core";
import { IGridModule } from "../../interfaces";
import { GridRowSelection } from "./GridRowSelection";
import { IGridRowSelectionServiceMap } from "./runtime";

export interface IRowSelectionModuleParameters {
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
    /** Called when the selected records change, with the ids now selected. */
    onSelectionChanged?: (selectedRecordIds: string[]) => void;
}

export interface IRowSelectionModule extends IGridModule<'rowSelection'> { }

/** Builds the module that lets rows be selected. */
export const createRowSelectionModule = (parameters: IRowSelectionModuleParameters): IRowSelectionModule => ({
    name: 'rowSelection',
    agGridModules: [RowSelectionModule],
    onLoad: ({ services: gridServices }) => {
        const services = new ServiceRegistry<IGridRowSelectionServiceMap>();
        services.provide('gridServices', gridServices);
        return new GridRowSelection({ services, mode: parameters.mode, onSelectionChanged: parameters.onSelectionChanged });
    },
});
