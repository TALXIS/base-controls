import { useEffect, useState } from "react";
import { useGanttModule, useGanttService } from "../../../../../context";
import { getTimelineX } from "../../../../../timeline/getTimelineX";
import { GANTT_NON_WORKING_DAY_CLASS } from "../../../classNames";
import type { IGanttNonWorkingDay } from "../../../GanttNonWorkingDays";
import { NonWorkingDayTooltip } from "../../ui/non-working-day-tooltip";

interface IHoveredCell {
    cell: HTMLElement;
    days: IGanttNonWorkingDay<unknown>[];
}

/** Finds the shaded scale cell under the pointer and shows its day's descriptions. */
export const NonWorkingDayScaleTooltip = () => {
    const nonWorkingDays = useGanttModule('nonWorkingDays');
    const chart = useGanttService('chart');
    const [hovered, setHovered] = useState<IHoveredCell>();

    useEffect(() => {
        if (!chart) {
            return;
        }
        const onMouseMove = (event: MouseEvent) => {
            const cell = (event.target as HTMLElement | null)?.closest<HTMLElement>(`.gantt_scale_cell.${GANTT_NON_WORKING_DAY_CLASS}`);
            if (!cell) {
                setHovered(undefined);
                return;
            }
            const date = chart.dateFromPos(getTimelineX(chart, event.clientX));
            const days = nonWorkingDays.getNonWorkingDays(date).filter(day => day.description);
            setHovered(current => current?.cell === cell ? current : days.length > 0 ? { cell, days } : undefined);
        };
        const onMouseLeave = () => setHovered(undefined);
        chart.$root.addEventListener('mousemove', onMouseMove);
        chart.$root.addEventListener('mouseleave', onMouseLeave);
        return () => {
            chart.$root?.removeEventListener('mousemove', onMouseMove);
            chart.$root?.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [chart]);

    return hovered ? <NonWorkingDayTooltip target={hovered.cell} days={hovered.days} components={nonWorkingDays.getComponents().tooltip} /> : null;
};
