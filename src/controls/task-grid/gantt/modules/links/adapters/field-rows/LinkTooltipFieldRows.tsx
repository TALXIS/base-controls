import { ReactNode } from "react";
import { IRecordCardFieldRowsComponents, RecordCardFieldRows } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IRecordCardFieldRowsComponents>;
}

/** The rows, one under another. */
export const LinkTooltipFieldRows = (props: ILinkTooltipFieldRowsProps) => {
    //called only to throw outside the tooltip
    useLinkTooltip();
    return <RecordCardFieldRows components={props.components}>{props.children}</RecordCardFieldRows>;
};
