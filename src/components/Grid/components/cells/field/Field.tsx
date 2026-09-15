import { useLayoutEffect, useMemo } from "react";
import { IRecord } from "@talxis/client-libraries";
import { GridField } from "../../../services/fields";
import { GridFieldContext } from "./context";
import { useGridService } from "../../../useGridService";

export interface IGridFieldProps {
    record: IRecord;
    /** The column to bind to, by name. */
    name: string;
    children?: React.ReactNode;
}

/**
 * What binds everything drawn inside it to one record's column.
 *
 * Draws nothing of its own: whatever is under it reaches the field with `useGridField`, and what being
 * bound to one implies - what it reads as, whether it is valid - follows from there.
 */
export const Field = (props: IGridFieldProps) => {
    const { record, name, children } = props;
    const cells = useGridService('cells');
    //the record instance, not its id: a reload hands the same row a new record, and a field holding the
    //previous one would answer for a record nothing is looking at
    const field = useMemo(() => new GridField({ record: record, columnName: name, cells: cells }), [record, name, cells]);

    useLayoutEffect(() => () => field.destroy(), [field]);

    return <GridFieldContext.Provider value={field}>{children}</GridFieldContext.Provider>;
};
