import { ServiceLocator } from "@utils";
import { IGridModule } from "../../interfaces";
import { GridRowSelection } from "./GridRowSelection";
import { IGridRowSelectionServiceMap } from "./services";
import { IGridRowSelectionComponents } from "./moduleComponents";

export interface IRowSelectionModuleOptions {
    /** How many rows may be selected at once. */
    mode: 'single' | 'multiple';
    /** Overrides for the parts of the row checkbox cell and of the header. */
    components?: Partial<IGridRowSelectionComponents>;
    /** Called when the selected records change, with the ids now selected. */
    onSelectionChanged?: (selectedRecordIds: string[]) => void;
}

/** Builds the module that lets rows be selected. */
export const createRowSelectionModule = (options: IRowSelectionModuleOptions): IGridModule => ({
    onRegister: ({ services: gridServices }) => {
        const services = new ServiceLocator<IGridRowSelectionServiceMap>();
        services.register('gridServices', () => gridServices);
        services.register('components', () => options.components ?? {});
        const selection = new GridRowSelection({ services, mode: options.mode, onSelectionChanged: options.onSelectionChanged });
        gridServices.register('rowSelection', () => selection);
    },
});
