import { Task } from 'gantt-trial'
import { useCallback, useEffect, useRef, useState } from 'react';
import { useEventEmitter } from '@hooks';
import { IGanttDraggingEvents } from '../../../gantt-dragging';
import { GANTT_TASK_ROW_CLASS } from '../../../classNames';
import { useGanttService, useGanttServices } from '../../../context';

/** The hovered task and the pointer event that opened the tooltip on it. */
export interface ITooltipState {
	task: Task;
	event: MouseEvent;
}

/**
 * The task tooltip: which task the pointer is over, or the one being dragged.
 *
 * Waits for the container the chart is drawn into and for the dragging part — until both resolve there is
 * nothing to hover.
 */
export const useTooltip = () => {
	const services = useGanttServices();
	const container = useGanttService('ganttContainer');
	const dragging = useGanttService('ganttDragging');
	const [tooltipState, setTooltipState] = useState<ITooltipState | null>(null);
	const draggingTaskIdRef = useRef<string | null>(null);

	const onMouseMove = useCallback((event: MouseEvent) => {
		const gantt = services.find('ganttChart');
		if (!gantt) {
			return;
		}
		//another gesture has the pointer - drawing a task, or a box selection. Two callouts over one
		//pointer read as a glitch. Resolved here rather than closed over: this callback is built once, when
		//there is no chart yet and so no dragging part either
		if (services.find('ganttDragging')?.isDraggingDisabled()) {
			setTooltipState(null);
			return;
		}
		if (draggingTaskIdRef.current) {
			setTooltipState({ task: gantt.getTask(draggingTaskIdRef.current), event });
			return;
		}
		const taskAttr = gantt.config.task_attribute;
		const taskNode = (event.target as HTMLElement).closest<HTMLElement>(`[${taskAttr}]:not(.${GANTT_TASK_ROW_CLASS})`);
		if (!taskNode) {
			setTooltipState(null);
			return;
		}

		const taskId = taskNode.getAttribute(taskAttr);
		if (!taskId || !gantt.isTaskExists(taskId)) {
			setTooltipState(null);
			return;
		}

		setTooltipState({ task: gantt.getTask(taskId), event });
	}, []);

	const onMouseOut = useCallback((event: MouseEvent) => {
		const gantt = services.find('ganttChart');
		if (!gantt || draggingTaskIdRef.current) {
			return;
		}
		const taskAttr = gantt.config.task_attribute;
		const related = event.relatedTarget as HTMLElement | null;
		if (!related?.closest(`[${taskAttr}]:not(.${GANTT_TASK_ROW_CLASS})`)) {
			setTooltipState(null);
		}
	}, []);

	useEventEmitter<IGanttDraggingEvents>(dragging?.events, 'onDragStarted', (taskId) => {
		draggingTaskIdRef.current = taskId;
	});

	useEventEmitter<IGanttDraggingEvents>(dragging?.events, 'onDragEnded', () => {
		draggingTaskIdRef.current = null;
		setTooltipState(null);
	});

	useEffect(() => {
		if (!container) {
			return;
		}
		container.addEventListener('mousemove', onMouseMove);
		container.addEventListener('mouseout', onMouseOut);
		return () => {
			container.removeEventListener('mousemove', onMouseMove);
			container.removeEventListener('mouseout', onMouseOut);
		};
	}, [container, onMouseMove, onMouseOut]);

	return { tooltip: tooltipState };
}