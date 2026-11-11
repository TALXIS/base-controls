import { useEffect, useState } from "react";
import { useGanttModule, useGanttService } from "../../../../context";
import { GANTT_SCALE_CELL_CLASS } from "../../../../chart";
import { NON_WORKING_DAY_CLASS } from "../../classNames";
import { INonWorkingDaysUiTooltipDay, NonWorkingDaysUiTooltip } from "../../ui/tooltip";

interface IHoveredCell {
    cell: HTMLElement;
    days: INonWorkingDaysUiTooltipDay[];
}

/** Finds the shaded scale cell under the pointer and shows its day's descriptions. */
export const NonWorkingDayScaleTooltip = () => {
    const nonWorkingDays = useGanttModule('nonWorkingDays');
    const chart = useGanttService('chart');
    const timeline = useGanttService('timeline');
    const [hovered, setHovered] = useState<IHoveredCell>();

    useEffect(() => {
        if (!chart || !timeline) {
            return;
        }
        const onMouseMove = (event: MouseEvent) => {
            const cell = (event.target as HTMLElement | null)?.closest<HTMLElement>(`.${GANTT_SCALE_CELL_CLASS}.${NON_WORKING_DAY_CLASS}`);
            if (!cell) {
                setHovered(undefined);
                return;
            }
            const date = chart.dateFromPos(timeline.getTimelineX(event.clientX));
            const days = nonWorkingDays.getNonWorkingDays(date).flatMap(day => day.description ? [{ id: day.id, description: day.description }] : []);
            setHovered(current => current?.cell === cell ? current : days.length > 0 ? { cell, days } : undefined);
        };
        const onMouseLeave = () => setHovered(undefined);
        //the chart may be destroyed first, and its teardown clears $root
        const listeners = new AbortController();
        chart.$root.addEventListener('mousemove', onMouseMove, { signal: listeners.signal });
        chart.$root.addEventListener('mouseleave', onMouseLeave, { signal: listeners.signal });
        return () => listeners.abort();
    }, [chart, timeline]);

    return hovered ? <NonWorkingDaysUiTooltip target={hovered.cell} days={hovered.days} components={nonWorkingDays.getComponents().tooltip} /> : null;
};
