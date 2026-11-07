import { ReactNode } from "react";
import { IRecordCardComponents, RecordCard } from "@ui";
import { useMapRecord } from "../../context";

export interface IMapPopupCardProps {
    children?: ReactNode;
    components?: Partial<IRecordCardComponents>;
}

/** The box the popup's content sits in. */
export const MapPopupCard = (props: IMapPopupCardProps) => {
    //called only to throw outside a pin
    useMapRecord();
    return <RecordCard components={props.components}>{props.children}</RecordCard>;
};
