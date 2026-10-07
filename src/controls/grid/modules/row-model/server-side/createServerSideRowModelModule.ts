import { ServerSideRowModelApiModule, ServerSideRowModelModule as AgServerSideRowModelModule } from "ag-grid-enterprise";
import { IGridModule } from "../../../interfaces";
import { ServerSideRowModel } from "./ServerSideRowModel";

/** Builds the row-model module that reads a level at a time through a datasource. */
export const createServerSideRowModelModule = (): IGridModule => ({
    agGridModules: [AgServerSideRowModelModule, ServerSideRowModelApiModule],
    onRegister: ({ services }) => {
        const rowModel = new ServerSideRowModel({ services });
        services.register('rowModel', () => rowModel);
    },
});
