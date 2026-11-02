import { useEffect, useMemo, useRef, useState } from "react";
import type { GanttStatic } from "dhtmlx-gantt";
import { useGantt, useGanttModule } from "../../../../../context";
import type { IGanttDragging } from "../../../../../dragging";
import { TASK_BAR_HEIGHT } from "../../../../../tasks";
import { TASK_DRAWING_ARMED_CLASS } from "../../../classNames";
import { getCreateTarget, isCreateTarget, ITimelineCreateTarget } from "../../../timelineGeometry";
import { TaskDrawingUiPreview, ITaskDrawingUiPreviewProps } from "../../ui/preview";
import { useTimelineAutoScroll } from "./useTimelineAutoScroll";

export interface ITaskDrawingGestureProps {
    chart: GanttStatic;
    dragging: IGanttDragging;
}

interface IActiveDrag extends ITimelineCreateTarget {
    anchorX: number;
    clientX: number;
}

interface IPointer {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
}

/** Listens for Ctrl and Ctrl+drag over the chart and draws the preview of the task. */
export const TaskDrawingGesture = (props: ITaskDrawingGestureProps) => {
    const { chart, dragging } = props;
    const gantt = useGantt();
    const taskDrawing = useGanttModule('taskDrawing');
    const timeline = gantt.services.get('timeline');
    const schedule = gantt.services.get('schedule');
    const [preview, setPreview] = useState<Omit<ITaskDrawingUiPreviewProps, 'components'>>();
    const activeDragRef = useRef<IActiveDrag>();
    const pointerRef = useRef<IPointer>();
    const releaseDraggingRef = useRef<() => void>();

    const getSpan = (activeDrag: IActiveDrag) => schedule.snapSpan({ start: chart.dateFromPos(activeDrag.anchorX), end: chart.dateFromPos(Math.max(activeDrag.anchorX, timeline.getTimelineX(activeDrag.clientX))) });
    const canScrollLeft = () => !!activeDragRef.current && timeline.getTimelineX(activeDragRef.current.clientX) > activeDragRef.current.anchorX;
    const autoScroll = useTimelineAutoScroll(chart, canScrollLeft, () => updatePreview());

    const setArmed = (isArmed: boolean) => {
        if (isArmed) {
            releaseDraggingRef.current ??= dragging.disableDragging();
        }
        else {
            releaseDraggingRef.current?.();
            releaseDraggingRef.current = undefined;
        }
        chart.$root?.classList.toggle(TASK_DRAWING_ARMED_CLASS, isArmed);
    };

    const updatePreview = () => {
        const activeDrag = activeDragRef.current;
        const pointer = pointerRef.current;
        if (activeDrag) {
            const span = getSpan(activeDrag);
            const startX = chart.posFromDate(span.start);
            setPreview({
                row: { top: activeDrag.rowTop, height: activeDrag.rowHeight },
                span: { left: startX - chart.getScrollState().x, width: chart.posFromDate(span.end) - startX, height: TASK_BAR_HEIGHT },
                text: schedule.formatSpan(span).range,
                target: { x: activeDrag.clientX + 10, y: (pointer?.clientY ?? 0) + 12 },
            });
            return;
        }
        if (pointer && isCreateTarget(chart, pointer.target)) {
            const date = chart.dateFromPos(timeline.getTimelineX(pointer.clientX));
            setPreview({ text: schedule.formatSpan(schedule.snapSpan({ start: date, end: date })).start, target: { x: pointer.clientX + 10, y: pointer.clientY + 12 } });
            return;
        }
        setPreview(undefined);
    };

    const stopDrawing = () => {
        activeDragRef.current = undefined;
        autoScroll.stop();
        setArmed(false);
        setPreview(undefined);
    };

    const listeners = useMemo(() => ({
        onKeyDown: (event: KeyboardEvent) => {
            if (event.key === 'Control' && taskDrawing.isEnabled()) {
                setArmed(true);
                updatePreview();
            }
        },
        //a drag under way ends on mouseup, whatever the key does
        onKeyUp: (event: KeyboardEvent) => {
            if (event.key === 'Control' && !activeDragRef.current) {
                stopDrawing();
            }
        },
        onMouseDown: (event: MouseEvent) => {
            const target = event.ctrlKey && event.button === 0 && taskDrawing.isEnabled() ? getCreateTarget(chart, event.target) : undefined;
            if (!target) {
                return;
            }
            //the chart would otherwise start dragging the bar underneath
            event.preventDefault();
            event.stopImmediatePropagation();
            setArmed(true);
            activeDragRef.current = { ...target, anchorX: timeline.getTimelineX(event.clientX), clientX: event.clientX };
            updatePreview();
        },
        onMouseMove: (event: MouseEvent) => {
            pointerRef.current = { clientX: event.clientX, clientY: event.clientY, target: event.target };
            const activeDrag = activeDragRef.current;
            if (!activeDrag && !event.ctrlKey) {
                stopDrawing();
                return;
            }
            if (activeDrag) {
                Object.assign(activeDrag, getCreateTarget(chart, event.target), { clientX: event.clientX });
                autoScroll.sync(event.clientX);
            }
            updatePreview();
        },
        onBlur: () => stopDrawing(),
        onMouseUp: () => {
            const activeDrag = activeDragRef.current;
            if (!activeDrag) {
                return;
            }
            if (activeDrag.rowTaskId) {
                taskDrawing.create(activeDrag.rowTaskId, getSpan(activeDrag));
            }
            stopDrawing();
        },
        //Ctrl+click opens the context menu on a Mac
        onContextMenu: (event: MouseEvent) => {
            if (event.ctrlKey && isCreateTarget(chart, event.target)) {
                event.preventDefault();
            }
        },
    }), [chart, dragging, taskDrawing]);

    useEffect(() => {
        const windowListeners = new AbortController();
        const { signal } = windowListeners;
        window.addEventListener('keydown', listeners.onKeyDown, { signal });
        window.addEventListener('keyup', listeners.onKeyUp, { signal });
        window.addEventListener('mousemove', listeners.onMouseMove, { signal });
        window.addEventListener('mouseup', listeners.onMouseUp, { signal });
        window.addEventListener('blur', listeners.onBlur, { signal });
        //captured, ahead of the chart's own mousedown
        chart.$root.addEventListener('mousedown', listeners.onMouseDown, true);
        chart.$root.addEventListener('contextmenu', listeners.onContextMenu, true);
        return () => {
            windowListeners.abort();
            autoScroll.stop();
        };
    }, [chart, listeners]);

    return preview ? <TaskDrawingUiPreview {...preview} components={taskDrawing.getComponents().preview} /> : null;
};
