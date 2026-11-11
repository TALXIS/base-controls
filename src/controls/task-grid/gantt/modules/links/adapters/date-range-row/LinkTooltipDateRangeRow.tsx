import type { IRecord } from "@talxis/client-libraries";
import type { GanttSpanEdge } from "../../../../schedule";
import { IRecordCardDateRangeComponents, RecordCardDateRange } from "@ui";
import { useLinkTooltip } from "../link-tooltip-surface/context";

export interface ILinkTooltipDateRangeRowProps {
    components?: Partial<IRecordCardDateRangeComponents>;
}

/** The dates the dependency links, from the predecessor's edge to the successor's. */
export const LinkTooltipDateRangeRow = (props: ILinkTooltipDateRangeRowProps) => {
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
    return <RecordCardDateRange range={`${from} → ${to}`} components={props.components} />;
};
