import { useContext, useLayoutEffect, useMemo } from "react";
import { IRecord } from "@talxis/client-libraries";
import { GridField } from "../../../services/fields";
import { GridFieldContext } from "./context";
import { GridServicesContext } from "../../../context";

export interface ICellFieldProps {
    record: IRecord;
    /** The column to bind to, by name. */
    name: string;
    children?: React.ReactNode;
}

/** What binds everything drawn inside it to one record's column. */
export const CellField = (props: ICellFieldProps) => {
    const { record, name, children } = props;
    const services = useContext(GridServicesContext);
    //the instance, not its id: a reload hands the same row a new record
    const field = useMemo(() => new GridField({ record: record, columnName: name, services: services }), [record, name, services]);

    useLayoutEffect(() => () => field.destroy(), [field]);

    return <GridFieldContext.Provider value={field}>{children}</GridFieldContext.Provider>;
};
