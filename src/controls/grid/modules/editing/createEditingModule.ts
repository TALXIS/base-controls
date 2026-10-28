import { CustomEditorModule } from "ag-grid-community";
import { IGridModule } from "../../interfaces";
import { GridEditing, IGridEditingEvents } from "./GridEditing";

export interface IEditingModuleOptions {
    /** Whether an edit saves its record straight away. */
    autoSave?: boolean;
    /** Fired when an editor opens or closes, or the user steps into or out of a one-click cell. */
    onEditedCellChanged?: IGridEditingEvents['onEditedCellChanged'];
}

export interface IEditingModule extends IGridModule<'editing'> { }

/** Builds the module that lets the grid's cells be edited. */
export const createEditingModule = (options?: IEditingModuleOptions): IEditingModule => ({
    name: 'editing',
    agGridModules: [CustomEditorModule],
    onLoad: ({ services }) => new GridEditing({ services, autoSave: options?.autoSave, onEditedCellChanged: options?.onEditedCellChanged }),
    onDestroy: editing => editing.destroy(),
});
