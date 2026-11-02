import { ReactNode, useEffect } from "react";
import type { IPoint } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import type { ITaskDependency } from "../../../../../../dependencies";
import { useGantt, useGanttService } from "../../../../../context";
import type { IGanttDraggingEvents } from "../../../../../dragging/GanttDragging";
import { isChartPointerBusy, useHoverIntent } from "../../../../../hover";
import { LinkTooltipContext } from "./context";

export interface ILinkTooltipRootProps {
    children?: ReactNode;
}

interface IHoveredLink {
    dependency: ITaskDependency;
    target: IPoint;
}

/** Finds the dependency line under the pointer and draws its children for it. */
export const LinkTooltipRoot = (props: ILinkTooltipRootProps) => {
    const gantt = useGantt();
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
            const linkId = (event.target as HTMLElement | null)?.closest(`.gantt_task_link[${chart.config.link_attribute}]`)?.getAttribute(chart.config.link_attribute);
            const dependencies = gantt.getTaskRuntime().services.get('datasetControl').modules.find('dependencies');
            const dependency = linkId && !dragging.isDraggingDisabled() && !chart.getState().drag_mode && !isChartPointerBusy(chart, event) ? dependencies?.getDependencies().find(item => item.id === linkId) : undefined;
            setHovered(dependency ? { dependency, target: { x: event.clientX + 10, y: event.clientY + 12 } } : undefined);
        };
        const onMouseLeave = () => setHovered(undefined);
        chart.$root.addEventListener('mousemove', onMouseMove);
        chart.$root.addEventListener('mouseleave', onMouseLeave);
        return () => {
            chart.$root?.removeEventListener('mousemove', onMouseMove);
            chart.$root?.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [chart, dragging]);

    if (!tasks || !hovered) {
        return null;
    }
    const { dependency, target } = hovered;
    const context = { gantt, dependency, target, predecessor: tasks.getRecord(dependency.predecessorTaskId), successor: tasks.getRecord(dependency.successorTaskId) };
    return <LinkTooltipContext.Provider value={context}>{props.children}</LinkTooltipContext.Provider>;
};
