import { IGridModule } from "../../interfaces";
import { GridEditing, IGridEditingComponents, IGridEditingEvents } from "./GridEditing";

export interface IEditingModuleOptions {
    /** Whether an edit saves its record straight away. */
    autoSave?: boolean;
    /** Fired when an editor opens or closes, or the user steps into or out of a one-click cell. */
    onEditedCellChanged?: IGridEditingEvents['onEditedCellChanged'];
    /** Replaces pieces of what the module draws. */
    components?: IGridEditingComponents;
}

/** Builds the module that lets the grid's cells be edited. */
export const createEditingModule = (options?: IEditingModuleOptions): IGridModule => ({
    onRegister: ({ services }) => {
        const editing = new GridEditing({ services, autoSave: options?.autoSave, onEditedCellChanged: options?.onEditedCellChanged, components: options?.components });
        services.register('editing', () => editing);
    },
});
