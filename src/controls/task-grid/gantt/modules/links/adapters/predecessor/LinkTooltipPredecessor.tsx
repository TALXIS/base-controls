import type { IFieldValueComponents } from "@ui";
import { LinkTooltipTask } from "../task";

export interface ILinkTooltipPredecessorProps {
    /** Defaults to `Previous`. */
    iconName?: string;
    components?: Partial<IFieldValueComponents>;
}

/** The name of the dependency's predecessor. */
export const LinkTooltipPredecessor = (props: ILinkTooltipPredecessorProps) => {
    return <LinkTooltipTask end="predecessor" iconName={props.iconName ?? 'Previous'} components={props.components} />;
};
