import { ReactNode } from "react";
import { IFieldListComponents, Field } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipFieldListProps {
    children?: ReactNode;
    components?: Partial<IFieldListComponents>;
}

/** The link's fields, one under another. */
export const LinkTooltipFieldList = (props: ILinkTooltipFieldListProps) => {
    //called only to throw outside the tooltip
    useLinkTooltip();
    return <Field.List components={props.components}>{props.children}</Field.List>;
};
