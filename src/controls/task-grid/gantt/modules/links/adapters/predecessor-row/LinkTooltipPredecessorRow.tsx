import type { IRecordCardFieldRowComponents } from "@ui";
import { LinkTooltipTaskRow } from "../task-row";

export interface ILinkTooltipPredecessorRowProps {
    /** Defaults to `Previous`. */
    iconName?: string;
    components?: Partial<IRecordCardFieldRowComponents>;
}

/** The name of the dependency's predecessor. */
export const LinkTooltipPredecessorRow = (props: ILinkTooltipPredecessorRowProps) => {
    return <LinkTooltipTaskRow end="predecessor" iconName={props.iconName ?? 'Previous'} components={props.components} />;
};
