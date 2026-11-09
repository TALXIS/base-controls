import { CustomEditorModule } from "ag-grid-community";
import { IGridModule } from "../../interfaces";
import { GridEditing } from "./GridEditing";

export interface IEditingModuleParameters {
    /** Whether an edit saves its record straight away. */
    enableAutoSave?: boolean;
}

export interface IEditingModule extends IGridModule<'editing'> { }

/** Builds the module that lets the grid's cells be edited. */
export const createEditingModule = (parameters?: IEditingModuleParameters): IEditingModule => ({
    name: 'editing',
    agGridModules: [CustomEditorModule],
    onLoad: ({ services }) => new GridEditing({ services, enableAutoSave: parameters?.enableAutoSave }),
});
