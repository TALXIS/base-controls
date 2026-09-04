import { ServerSideRowModelModule as AgServerSideRowModelModule } from "@ag-grid-enterprise/server-side-row-model";
import { IGridRowModelModule } from "../../interfaces";
import { ServerSideRowModel } from "./ServerSideRowModel";

/**
 * Builds the row-model module that reads a level at a time through a datasource — what a grid paging a
 * dataset it does not hold wants.
 *
 * @example
 * ```tsx
 * <Grid dataset={dataset} modules={{ rowModel: createServerSideRowModelModule() }} />
 * ```
 */
export const createServerSideRowModelModule = (): IGridRowModelModule => ({
    agGridModules: [AgServerSideRowModelModule],
    getInitialComponentProps: () => ({ rowModelType: 'serverSide' }),
    onRegister: services => {
        const rowModel = new ServerSideRowModel({ services });
        services.register('rowModel', () => rowModel);
    },
});
