import { useMemo } from "react";
import { GridRoot } from "../Grid";
import type { IGridModule, IGridProps } from "../interfaces";
import { createClientSideRowModelModule } from "../modules/row-model/client-side/createClientSideRowModelModule";

export interface IClientSideGridProps extends Omit<IGridProps, 'modules'> {
    /** Further modules, loaded with the row model; read once, at mount. */
    modules?: IGridModule[];
}

/** A `Grid` that holds every row at once. */
export const ClientSideGrid = (props: IClientSideGridProps) => {
    const rowModel = useMemo(() => createClientSideRowModelModule(), []);
    return <GridRoot {...props} modules={[rowModel, ...props.modules ?? []]} />;
};
