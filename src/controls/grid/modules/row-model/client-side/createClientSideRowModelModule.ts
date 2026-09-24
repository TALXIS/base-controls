import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule as AgClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { IGridRowModelModule } from "../../interfaces";
import { ClientSideRowModel } from "./ClientSideRowModel";

/**
 * Builds the row-model module that holds every row at once.
 *
 * @example
 */
export const createClientSideRowModelModule = (): IGridRowModelModule => ({
    agGridModules: [AgClientSideRowModelModule],
    //stated here rather than read off the instance below
    onGetInitialComponentProps: () => ({ rowModelType: 'clientSide' }),
    onRegister: services => {
        const rowModel = new ClientSideRowModel({ services });
        services.register('rowModel', () => rowModel);
    },
});
