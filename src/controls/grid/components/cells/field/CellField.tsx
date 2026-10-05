import { IRecord } from "@talxis/client-libraries";
import { GridFieldContext } from "./context";
import { useGridService } from "../../../useGridService";

export interface ICellFieldProps {
    record: IRecord;
    /** The column to bind to, by name. */
    name: string;
    children?: React.ReactNode;
}

/** What binds everything drawn inside it to one record's column. */
export const CellField = (props: ICellFieldProps) => {
    const { record, name, children } = props;
    const field = useGridService('fields').get(record, name);

    return <GridFieldContext.Provider value={field}>{children}</GridFieldContext.Provider>;
};
