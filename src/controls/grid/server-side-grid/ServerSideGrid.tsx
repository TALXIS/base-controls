import { useMemo } from "react";
import { GridRoot } from "../Grid";
import type { IGridModule, IGridProps } from "../interfaces";
import { createServerSideRowModelModule } from "../modules/row-model/server-side/createServerSideRowModelModule";

export interface IServerSideGridProps extends Omit<IGridProps, 'modules'> {
    /** Further modules, loaded with the row model; read once, at mount. */
    modules?: IGridModule[];
}

/** A `Grid` that reads a level at a time, through AG Grid Enterprise's server-side row model. */
export const ServerSideGrid = (props: IServerSideGridProps) => {
    const rowModel = useMemo(() => createServerSideRowModelModule(), []);
    return <GridRoot {...props} modules={[rowModel, ...props.modules ?? []]} />;
};
