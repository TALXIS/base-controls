import type { ITooltipUiFieldRowComponents } from "../../../../ui/tooltip";
import { LinkTooltipTaskRow } from "../task-row";

export interface ILinkTooltipSuccessorRowProps {
    /** Defaults to `Next`. */
    iconName?: string;
    components?: Partial<ITooltipUiFieldRowComponents>;
}

/** The name of the dependency's successor. */
export const LinkTooltipSuccessorRow = (props: ILinkTooltipSuccessorRowProps) => {
    return <LinkTooltipTaskRow end="successor" iconName={props.iconName ?? 'Next'} components={props.components} />;
};
