import { ReactNode } from "react";
import { IFieldListComponents, FieldList } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<IFieldListComponents>;
}

/** The rows, one under another. */
export const LinkTooltipFieldRows = (props: ILinkTooltipFieldRowsProps) => {
    //called only to throw outside the tooltip
    useLinkTooltip();
    return <FieldList components={props.components}>{props.children}</FieldList>;
};
