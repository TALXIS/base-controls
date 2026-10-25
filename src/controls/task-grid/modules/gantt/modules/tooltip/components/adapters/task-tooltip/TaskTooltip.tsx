import { ReactNode, useEffect, useRef, useState } from "react";
import type { IPoint } from "@fluentui/react";
import { useEventEmitter } from "@hooks";
import { useGantt, useGanttService } from "../../../../../context";
import type { IGanttDraggingEvents } from "../../../../../dragging/GanttDragging";
import { TaskTooltipContext } from "./context";

export interface ITaskTooltipRootProps {
    children?: ReactNode;
}

interface IHoveredTask {
    taskId: string;
    target: IPoint;
}

/** Finds the bar under the pointer, or the one being dragged, and draws its children for it. */
export const TaskTooltipRoot = (props: ITaskTooltipRootProps) => {
    const gantt = useGantt();
    const chart = useGanttService('chart');
    const dragging = useGanttService('dragging');
    const tasks = useGanttService('tasks');
    const [hovered, setHovered] = useState<IHoveredTask>();
    const draggedTaskIdRef = useRef<string>();

    useEventEmitter<IGanttDraggingEvents>(dragging?.events, 'onDragStarted', taskId => draggedTaskIdRef.current = taskId);
    useEventEmitter<IGanttDraggingEvents>(dragging?.events, 'onDragEnded', () => {
        draggedTaskIdRef.current = undefined;
        setHovered(undefined);
    });

    useEffect(() => {
        if (!chart || !dragging) {
            return;
        }
        const onMouseMove = (event: MouseEvent) => {
            //another gesture has the pointer
            if (dragging.isDraggingDisabled()) {
                setHovered(undefined);
                return;
            }
            const taskId = draggedTaskIdRef.current ?? getBarTaskId(event, chart.config.task_attribute);
            setHovered(taskId && chart.isTaskExists(taskId) ? { taskId, target: { x: event.clientX + 10, y: event.clientY + 12 } } : undefined);
        };
        const onMouseLeave = () => {
            if (!draggedTaskIdRef.current) {
                setHovered(undefined);
            }
        };
        chart.$root.addEventListener('mousemove', onMouseMove);
        chart.$root.addEventListener('mouseleave', onMouseLeave);
        return () => {
            chart.$root?.removeEventListener('mousemove', onMouseMove);
            chart.$root?.removeEventListener('mouseleave', onMouseLeave);
        };
    }, [chart, dragging]);

    const record = hovered && tasks?.getRecord(hovered.taskId);
    if (!chart || !hovered || !record) {
        return null;
    }
    const context = { gantt, record, task: chart.getTask(hovered.taskId), target: hovered.target };
    return <TaskTooltipContext.Provider value={context}>{props.children}</TaskTooltipContext.Provider>;
};

const getBarTaskId = (event: MouseEvent, taskAttribute: string): string | undefined => {
    return (event.target as HTMLElement | null)?.closest(`.gantt_task_line[${taskAttribute}]`)?.getAttribute(taskAttribute) ?? undefined;
};
