import { ReactNode } from "react";
import { ITooltipUiFieldRowsComponents, TooltipUiFieldRows } from "../../../../ui/tooltip";
import { useLinkTooltip } from "../link-tooltip-root";

export interface ILinkTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<ITooltipUiFieldRowsComponents>;
}

/** The rows, one under another. */
export const LinkTooltipFieldRows = (props: ILinkTooltipFieldRowsProps) => {
    //called only to throw outside a tooltip root
    useLinkTooltip();
    return <TooltipUiFieldRows components={props.components}>{props.children}</TooltipUiFieldRows>;
};
