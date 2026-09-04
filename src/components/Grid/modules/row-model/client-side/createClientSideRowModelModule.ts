import { ModuleRegistry } from "@ag-grid-community/core";
import { ClientSideRowModelModule as AgClientSideRowModelModule } from "@ag-grid-community/client-side-row-model";
import { IGridRowModelModule } from "../../interfaces";
import { ClientSideRowModel } from "./ClientSideRowModel";

/**
 * Builds the row-model module that holds every row at once — what a grid over a set already in memory
 * wants, and the only model that can render a hierarchy in one pass.
 *
 * @example
 * ```tsx
 * <Grid dataset={dataset} modules={{ rowModel: createClientSideRowModelModule() }} />
 * ```
 */
export const createClientSideRowModelModule = (): IGridRowModelModule => ({
    agGridModules: [AgClientSideRowModelModule],
    //stated here rather than read off the instance below: a builder that remembered one would be shared by
    //two grids given the same module object, and the second would overwrite the first
    getInitialComponentProps: () => ({ rowModelType: 'clientSide' }),
    onRegister: services => {
        const rowModel = new ClientSideRowModel({ services });
        services.register('rowModel', () => rowModel);
    },
});
