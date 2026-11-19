import type { IFieldValueComponents } from "@ui";
import { LinkTooltipTask } from "../task";

export interface ILinkTooltipSuccessorProps {
    /** Defaults to `Next`. */
    iconName?: string;
    components?: Partial<IFieldValueComponents>;
}

/** The name of the dependency's successor. */
export const LinkTooltipSuccessor = (props: ILinkTooltipSuccessorProps) => {
    return <LinkTooltipTask end="successor" iconName={props.iconName ?? 'Next'} components={props.components} />;
};
