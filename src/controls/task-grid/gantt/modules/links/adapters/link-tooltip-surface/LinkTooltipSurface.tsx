import { useEffect } from "react";
import type { IPoint } from "@fluentui/react";
import { useEventEmitter } from "@core";
import type { ITaskDependency } from "../../../../../modules/dependencies";
import { GANTT_TASK_LINK_CLASS } from "../../../../chart";
import { useGantt, useGanttModule, useGanttService } from "../../../../context";
import type { IGanttDraggingEvents } from "../../../../dragging";
import { isChartPointerBusy, useHoverIntent } from "../../../../hover";
import { LinkTooltipRenderer } from "../renderer/LinkTooltipRenderer";
import { LinkTooltipContext } from "./context";

interface IHoveredLink {
    dependency: ITaskDependency;
    target: IPoint;
}

/** Finds the dependency line under the pointer and draws its tooltip. */
export const LinkTooltipSurface = () => {
    const gantt = useGantt();
    const { onRender, ...parts } = useGanttModule('links').getComponents().tooltip ?? {};
    const chart = useGanttService('chart');
    const dragging = useGanttService('dragging');
    const tasks = useGanttService('tasks');
    const [hovered, setHovered] = useHoverIntent<IHoveredLink>();

    useEventEmitter<IGanttDraggingEvents>(dragging?.events, 'onDragStarted', () => setHovered(undefined));

    useEffect(() => {
        if (!chart || !dragging) {
            return;
        }
        const onMouseMove = (event: MouseEvent) => {
            const linkId = (event.target as HTMLElement | null)?.closest(`.${GANTT_TASK_LINK_CLASS}[${chart.config.link_attribute}]`)?.getAttribute(chart.config.link_attribute);
            const dependencies = gantt.getTaskRuntime().services.get('datasetControl').modules.find('dependencies');
            const dependency = linkId && !dragging.isDraggingDisabled() && !chart.getState().drag_mode && !isChartPointerBusy(chart, event) ? dependencies?.getDependencies().find(item => item.id === linkId) : undefined;
            setHovered(dependency ? { dependency, target: { x: event.clientX + 10, y: event.clientY + 12 } } : undefined);
        };
        const onMouseLeave = () => setHovered(undefined);
        //the chart may be destroyed first, and its teardown clears $root
        const listeners = new AbortController();
        chart.$root.addEventListener('mousemove', onMouseMove, { signal: listeners.signal });
        chart.$root.addEventListener('mouseleave', onMouseLeave, { signal: listeners.signal });
        return () => listeners.abort();
    }, [chart, dragging]);

    if (!tasks || !hovered) {
        return null;
    }
    const { dependency, target } = hovered;
    const context = { gantt, dependency, target, predecessor: tasks.getRecord(dependency.predecessorTaskId), successor: tasks.getRecord(dependency.successorTaskId) };
    return <LinkTooltipContext.Provider value={context}>
        {onRender ? onRender() : <LinkTooltipRenderer components={parts} />}
    </LinkTooltipContext.Provider>;
};
