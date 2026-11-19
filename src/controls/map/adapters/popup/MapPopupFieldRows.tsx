import { ReactNode } from "react";
import { IFieldListComponents, FieldList } from "@ui";
import { useMapRecord } from "../../context";

export interface IMapPopupFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IFieldListComponents>;
}

/** The rows of the record's fields, one under another. */
export const MapPopupFieldRows = (props: IMapPopupFieldRowsProps) => {
    //called only to throw outside a pin
    useMapRecord();
    return <FieldList components={props.components}>{props.children}</FieldList>;
};
