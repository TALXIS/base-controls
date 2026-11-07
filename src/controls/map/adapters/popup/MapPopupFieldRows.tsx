import { ReactNode } from "react";
import { IRecordCardFieldRowsComponents, RecordCardFieldRows } from "@ui";
import { useMapRecord } from "../../context";

export interface IMapPopupFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IRecordCardFieldRowsComponents>;
}

/** The rows of the record's fields, one under another. */
export const MapPopupFieldRows = (props: IMapPopupFieldRowsProps) => {
    //called only to throw outside a pin
    useMapRecord();
    return <RecordCardFieldRows components={props.components}>{props.children}</RecordCardFieldRows>;
};
