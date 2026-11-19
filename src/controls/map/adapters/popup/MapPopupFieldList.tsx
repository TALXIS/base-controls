import { ReactNode } from "react";
import { IFieldListComponents, Field } from "@ui";
import { useMapRecord } from "../../context";

export interface IMapPopupFieldListProps {
    children?: ReactNode;
    components?: Partial<IFieldListComponents>;
}

/** The record's fields, one under another. */
export const MapPopupFieldList = (props: IMapPopupFieldListProps) => {
    //called only to throw outside a pin
    useMapRecord();
    return <Field.List components={props.components}>{props.children}</Field.List>;
};
