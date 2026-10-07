import { ClientSideRowModelApiModule, ClientSideRowModelModule as AgClientSideRowModelModule } from "ag-grid-community";
import { IGridModule } from "../../../interfaces";
import { ClientSideRowModel } from "./ClientSideRowModel";

/** Builds the row-model module that holds every row at once. */
export const createClientSideRowModelModule = (): IGridModule => ({
    agGridModules: [AgClientSideRowModelModule, ClientSideRowModelApiModule],
    onRegister: ({ services }) => {
        const rowModel = new ClientSideRowModel({ services });
        services.register('rowModel', () => rowModel);
    },
});
