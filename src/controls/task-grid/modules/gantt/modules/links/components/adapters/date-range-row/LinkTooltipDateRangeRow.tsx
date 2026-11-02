import type { IRecord } from "@talxis/client-libraries";
import type { GanttSpanEdge } from "../../../../../schedule";
import { ITooltipUiDateRangeComponents, TooltipUiDateRange } from "../../../../../components/ui/tooltip";
import { useLinkTooltip } from "../link-tooltip-root";

export interface ILinkTooltipDateRangeRowProps {
    components?: Partial<ITooltipUiDateRangeComponents>;
}

/** The dates the dependency links, from the predecessor's edge to the successor's. */
export const LinkTooltipDateRangeRow = (props: ILinkTooltipDateRangeRowProps) => {
    const { gantt, dependency, predecessor, successor } = useLinkTooltip();
    const schedule = gantt.services.get('schedule');
    const formatEdge = (record: IRecord | undefined, edge: GanttSpanEdge) => {
        const span = record && schedule.getSpan(record);
        return span && schedule.formatSpan(span)[edge];
    };
    const from = formatEdge(predecessor, dependency.type === 'finishToStart' || dependency.type === 'finishToFinish' ? 'end' : 'start');
    const to = formatEdge(successor, dependency.type === 'finishToStart' || dependency.type === 'startToStart' ? 'start' : 'end');
    if (!from || !to) {
        return null;
    }
    return <TooltipUiDateRange range={`${from} → ${to}`} components={props.components} />;
};
