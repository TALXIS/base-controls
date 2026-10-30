import { ReactNode } from "react";
import { ITaskTooltipUiFieldRowsComponents, TaskTooltipUiFieldRows } from "../../../../tooltip/components/ui";
import { useLinkTooltip } from "../link-tooltip";

export interface ILinkTooltipFieldRowsProps {
    children?: ReactNode;
    components?: Partial<ITaskTooltipUiFieldRowsComponents>;
}

/** The rows, one under another. */
export const LinkTooltipFieldRows = (props: ILinkTooltipFieldRowsProps) => {
    //called only to throw outside a tooltip root
    useLinkTooltip();
    return <TaskTooltipUiFieldRows components={props.components}>{props.children}</TaskTooltipUiFieldRows>;
};
