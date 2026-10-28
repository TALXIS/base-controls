import { ServerSideRowModelApiModule, ServerSideRowModelModule as AgServerSideRowModelModule } from "ag-grid-enterprise";
import { IGridModule } from "../../../interfaces";
import { ServerSideRowModel } from "./ServerSideRowModel";

export interface IServerSideRowModelModule extends IGridModule<'rowModel'> { }

/** Builds the row-model module that reads a level at a time through a datasource. */
export const createServerSideRowModelModule = (): IServerSideRowModelModule => ({
    name: 'rowModel',
    agGridModules: [AgServerSideRowModelModule, ServerSideRowModelApiModule],
    onLoad: ({ services }) => new ServerSideRowModel({ services }),
});
