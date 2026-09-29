import { ClientSideRowModelModule as AgClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { IGridModule } from "../../interfaces";
import { ClientSideRowModel } from "./ClientSideRowModel";

/** Builds the row-model module that holds every row at once. */
export const createClientSideRowModelModule = (): IGridModule => ({
    agGridModules: [AgClientSideRowModelModule],
    onRegister: ({ services }) => {
        const rowModel = new ClientSideRowModel({ services });
        services.register('rowModel', () => rowModel);
    },
});
