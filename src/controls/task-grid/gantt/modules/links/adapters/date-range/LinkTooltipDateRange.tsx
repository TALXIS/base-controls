import type { IRecord } from "@talxis/client-libraries";
import type { GanttSpanEdge } from "../../../../schedule";
import { IFieldDateRangeComponents, Field } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipDateRangeProps {
    components?: Partial<IFieldDateRangeComponents>;
}

/** The dates the dependency links, from the predecessor's edge to the successor's. */
export const LinkTooltipDateRange = (props: ILinkTooltipDateRangeProps) => {
    const { gantt, dependency, predecessor, successor } = useLinkTooltip();
    const schedule = gantt.services.get('schedule');
    const formatEdge = (record: IRecord | undefined, edge: GanttSpanEdge) => {
        const placement = record && schedule.getPlacement(record);
        if (!placement) {
            return undefined;
        }
        return placement.kind === 'span' ? schedule.formatSpan(placement.span)[edge] : schedule.formatDate(placement.date, placement.edges[0]);
    };
    const from = formatEdge(predecessor, dependency.type === 'finishToStart' || dependency.type === 'finishToFinish' ? 'end' : 'start');
    const to = formatEdge(successor, dependency.type === 'finishToStart' || dependency.type === 'startToStart' ? 'start' : 'end');
    if (!from || !to) {
        return null;
    }
    return <Field.DateRange range={`${from} → ${to}`} components={props.components} />;
};
