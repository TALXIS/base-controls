import { useCallback, useEffect, useRef, useState } from "react";
import { Formatting } from "@talxis/client-libraries";
import { useTaskDataProvider } from '@components/TaskGrid/context';
import { useGanttService, useGanttServices } from '../../../../context';
import { getTaskCreateCursorStyles } from '../../styles';
import { getCreateTarget, getTimelineX, isCreateTarget, ITimelineCreateTarget } from './timelineGeometry';
import { useTimelineAutoScroll } from './useTimelineAutoScroll';

/** The line drawn from where the drag started to where the pointer is. */
interface ILinePreview {
    left: number;
    top: number;
    width: number;
    startDate: string;
    endDate: string;
}

/** The row the drag is happening on, highlighted behind the line. */
interface IRowOverlay {
    top: number;
    height: number;
}

/** The date under the pointer, shown while holding Ctrl before anything is dragged. */
interface IHoverPreview {
    target: {
        x: number;
        y: number;
    };
    date: string;
}

/** The drag in progress: where it started, where the pointer is, and the row it is on. */
interface IActiveDrag extends ITimelineCreateTarget {
    anchorTimelineX: number;
    currentClientX: number;
}

/**
 * Creating a task by dragging across empty timeline space, with Ctrl held.
 *
 * Ctrl arms it and previews the date under the pointer; a drag draws the span; releasing creates the task
 * between the dragged dates, directly above the row it was drawn on. Waits for the chart and its dragging
 * part — bar dragging is suppressed while this is armed, so the two cannot both act on one gesture.
 */
//one class for the whole module: mergeStyles hands back the same one for the same rules
const CURSOR_CLASS = getTaskCreateCursorStyles();

export const useTimelineTaskCreate = () => {
    const services = useGanttServices();
    const gantt = useGanttService('ganttChart');
    const dragging = useGanttService('ganttDragging');
    const dates = useGanttService('ganttDates');
    const taskDataProvider = useTaskDataProvider();
    const formatting = Formatting.Get();
    const [linePreview, setLinePreview] = useState<ILinePreview | null>(null);
    const [rowOverlay, setRowOverlay] = useState<IRowOverlay | null>(null);
    const [hoverPreview, setHoverPreview] = useState<IHoverPreview | null>(null);
    const activeDragRef = useRef<IActiveDrag | null>(null);
    const lastPointerRef = useRef<{ clientX: number; clientY: number; target: EventTarget | null } | null>(null);

    const canScrollLeft = () => {
        const activeDrag = activeDragRef.current;
        if (!activeDrag || !gantt) {
            return false;
        }
        //dragging leftwards only shrinks the span back towards where it started
        return getTimelineX(gantt, activeDrag.currentClientX) > activeDrag.anchorTimelineX;
    };

    const autoScroll = useTimelineAutoScroll({ gantt, canScrollLeft, onScrolled: () => updatePreview() });

    //the grid decides whether tasks can be created at all; read at call time, as the strategies read theirs
    const isTaskCreationEnabled = () => {
        return services.get('taskGridServices').get('gridParameters').enableTaskCreation ?? false;
    };

    const setTaskCreateMode = (enabled: boolean) => {
        if (!gantt || !dragging) {
            return;
        }
        dragging.setDraggingDisabled(enabled);
        gantt.$root.classList.toggle(CURSOR_CLASS, enabled);
    };

    const clearDrag = () => {
        activeDragRef.current = null;
        setLinePreview(null);
        setRowOverlay(null);
    };

    const updatePreview = () => {
        const activeDrag = activeDragRef.current;
        if (!activeDrag || !gantt) {
            setLinePreview(null);
            return;
        }

        const currentTimelineX = getTimelineX(gantt, activeDrag.currentClientX);
        setLinePreview({
            left: activeDrag.anchorTimelineX - gantt.getScrollState().x,
            top: activeDrag.top,
            width: Math.max(0, currentTimelineX - activeDrag.anchorTimelineX),
            startDate: formatting.formatDateShort(gantt.dateFromPos(activeDrag.anchorTimelineX)),
            endDate: formatting.formatDateShort(gantt.dateFromPos(currentTimelineX)),
        });
        setRowOverlay({
            top: activeDrag.rowTop,
            height: activeDrag.rowHeight,
        });
    };

    const updateHoverPreview = () => {
        const pointer = lastPointerRef.current;
        if (!gantt || !pointer || activeDragRef.current || !isCreateTarget(gantt, pointer.target)) {
            setHoverPreview(null);
            return;
        }

        setHoverPreview({
            target: {
                x: pointer.clientX + 10,
                y: pointer.clientY + 12,
            },
            date: formatting.formatDateShort(gantt.dateFromPos(getTimelineX(gantt, pointer.clientX))),
        });
    };

    const createTask = () => {
        const activeDrag = activeDragRef.current;
        if (!gantt || !dates || !activeDrag?.currentTaskId) {
            return;
        }
        //never backwards: dragging right to left leaves the span at the day it started on
        const endTimelineX = Math.max(activeDrag.anchorTimelineX, getTimelineX(gantt, activeDrag.currentClientX));
        const targetTask = gantt.getTask(activeDrag.currentTaskId);
        const recordTree = taskDataProvider.getRecordTree();

        taskDataProvider.createTask(
            //dhtmlx reports a root task's parent as 0, which is no parent at all here
            targetTask.parent ? String(targetTask.parent) : undefined,
            {
                previousTaskId: recordTree.structure.getNeighbours(activeDrag.currentTaskId).previous?.getRecordId(),
                nextTaskId: activeDrag.currentTaskId,
                data: {
                    [dates.getStartDateColumnName()]: gantt.dateFromPos(activeDrag.anchorTimelineX),
                    [dates.getEndDateColumnName()]: gantt.dateFromPos(endTimelineX),
                },
            });
    };

    const onKeyDown = useCallback((event: KeyboardEvent) => {
        if (event.key !== 'Control' || !isTaskCreationEnabled()) {
            return;
        }
        setTaskCreateMode(true);
        updateHoverPreview();
    }, [gantt, dragging]);

    const onKeyUp = useCallback((event: KeyboardEvent) => {
        //a drag already under way finishes on its own terms, whatever the key does
        if (event.key !== 'Control' || activeDragRef.current) {
            return;
        }
        setTaskCreateMode(false);
        autoScroll.stop();
        setHoverPreview(null);
        clearDrag();
    }, [gantt, dragging]);

    const onMouseDown = useCallback((event: MouseEvent) => {
        if (!gantt || !event.ctrlKey || event.button !== 0 || !isTaskCreationEnabled()) {
            return;
        }
        const target = getCreateTarget(gantt, event.target);
        if (!target) {
            return;
        }

        setTaskCreateMode(true);
        setHoverPreview(null);
        //the chart's own handlers would start dragging the bar underneath
        event.preventDefault();
        event.stopPropagation();
        event.stopImmediatePropagation?.();

        activeDragRef.current = {
            ...target,
            anchorTimelineX: getTimelineX(gantt, event.clientX),
            currentClientX: event.clientX,
        };
        updatePreview();
    }, [gantt, dragging]);

    const onMouseMove = useCallback((event: MouseEvent) => {
        lastPointerRef.current = { clientX: event.clientX, clientY: event.clientY, target: event.target };
        const activeDrag = activeDragRef.current;
        if (!activeDrag) {
            event.ctrlKey ? updateHoverPreview() : setHoverPreview(null);
            return;
        }

        //the row can change mid-drag: the span follows whichever row the pointer is over
        const target = gantt ? getCreateTarget(gantt, event.target) : null;
        if (target) {
            Object.assign(activeDrag, target);
        }
        activeDrag.currentClientX = event.clientX;
        autoScroll.sync(event.clientX);
        updatePreview();
    }, [gantt]);

    const onMouseUp = useCallback(() => {
        if (!activeDragRef.current) {
            return;
        }
        autoScroll.stop();
        createTask();
        clearDrag();
        setHoverPreview(null);
        setTaskCreateMode(false);
    }, [gantt, dragging, dates]);

    const onContextMenu = useCallback((event: MouseEvent) => {
        //Ctrl+click is the gesture on a Mac, so its context menu is not wanted here
        if (gantt && event.ctrlKey && isCreateTarget(gantt, event.target)) {
            event.preventDefault();
            event.stopPropagation();
        }
    }, [gantt]);

    useEffect(() => {
        if (!gantt) {
            return;
        }
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('mousemove', onMouseMove);
        window.addEventListener('mouseup', onMouseUp);
        //captured, because the chart's own mousedown handler would otherwise get there first
        gantt.$root.addEventListener('contextmenu', onContextMenu, true);
        gantt.$root.addEventListener('mousedown', onMouseDown, true);

        return () => {
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('mousemove', onMouseMove);
            window.removeEventListener('mouseup', onMouseUp);
            gantt.$root.removeEventListener('contextmenu', onContextMenu, true);
            gantt.$root.removeEventListener('mousedown', onMouseDown, true);
            setTaskCreateMode(false);
            autoScroll.stop();
            clearDrag();
        };
    }, [gantt, onKeyUp, onKeyDown, onMouseMove, onMouseUp, onContextMenu, onMouseDown]);

    return {
        hoverPreview,
        linePreview,
        rowOverlay,
    };
};
