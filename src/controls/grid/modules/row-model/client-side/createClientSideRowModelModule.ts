import { ClientSideRowModelApiModule, ClientSideRowModelModule as AgClientSideRowModelModule } from "ag-grid-community";
import { IGridModule } from "../../../interfaces";
import { ClientSideRowModel } from "./ClientSideRowModel";

export interface IClientSideRowModelModule extends IGridModule<'rowModel'> { }

/** Builds the row-model module that holds every row at once. */
export const createClientSideRowModelModule = (): IClientSideRowModelModule => ({
    name: 'rowModel',
    agGridModules: [AgClientSideRowModelModule, ClientSideRowModelApiModule],
    onLoad: ({ services }) => new ClientSideRowModel({ services }),
});
