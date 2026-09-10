import { useContext, useMemo } from "react";
import { IRecord } from "@talxis/client-libraries";
import { GridControl } from "./services/cells";
import { GridServicesContext } from "./context";

/**
 * The cell a component is drawing, as something to ask rather than something to describe.
 *
 * Memoized on the record instance rather than on its id: a load hands a cell a new instance for the same
 * row, and a control holding the previous one would answer for a record nothing else is looking at.
 */
export const useGridControl = (record: IRecord, columnName: string, takesInput: boolean = false): GridControl => {
    const services = useContext(GridServicesContext);
    return useMemo(() => new GridControl({ services: services, record: record, columnName: columnName, takesInput: takesInput }), [services, record, columnName, takesInput]);
};
