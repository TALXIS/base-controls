import { useEffect, useMemo, useRef, useState } from "react";
import { mergeStyles } from "@fluentui/react";
import type { GanttStatic } from "dhtmlx-gantt";
import { useGantt, useGanttModule, useGanttService } from "../../../../../context";
import type { IGanttDragging } from "../../../../../dragging/GanttDragging";
import { getCreateTarget, getTimelineX, isCreateTarget, ITimelineCreateTarget } from "../../../timelineGeometry";
import { CreatePreview, ICreatePreviewProps } from "../../ui/create-preview";
import { useTimelineAutoScroll } from "./useTimelineAutoScroll";

interface IActiveDrag extends ITimelineCreateTarget {
    anchorX: number;
    clientX: number;
}

interface IPointer {
    clientX: number;
    clientY: number;
    target: EventTarget | null;
}

//doubled to outweigh the chart's grab cursors while the next drag draws a task
const CREATE_CURSOR_CLASS = mergeStyles({ selectors: { '&&, && *': { cursor: 'copy' } } });

/** Ctrl shows the date under the pointer; Ctrl+drag draws a task above the row it is drawn on. */
export const TaskCreateLayer = () => {
    const chart = useGanttService('chart');
    const dragging = useGanttService('dragging');
    return chart && dragging ? <TaskCreateGesture chart={chart} dragging={dragging} /> : null;
};

const TaskCreateGesture = (props: { chart: GanttStatic; dragging: IGanttDragging }) => {
    const { chart, dragging } = props;
    const gantt = useGantt();
    const taskCreate = useGanttModule('taskCreate');
    const formatting = gantt.getTaskRuntime().getProvider().getFormatting();
    const [preview, setPreview] = useState<ICreatePreviewProps>();
    const activeDragRef = useRef<IActiveDrag>();
    const pointerRef = useRef<IPointer>();

    const formatDate = (timelineX: number) => formatting.formatDateShort(chart.dateFromPos(timelineX));
    const canScrollLeft = () => !!activeDragRef.current && getTimelineX(chart, activeDragRef.current.clientX) > activeDragRef.current.anchorX;
    const autoScroll = useTimelineAutoScroll(chart, canScrollLeft, () => updatePreview());

    const setArmed = (isArmed: boolean) => {
        dragging.setDraggingDisabled(isArmed);
        chart.$root?.classList.toggle(CREATE_CURSOR_CLASS, isArmed);
    };

    const updatePreview = () => {
        const activeDrag = activeDragRef.current;
        const pointer = pointerRef.current;
        if (activeDrag) {
            const endX = Math.max(activeDrag.anchorX, getTimelineX(chart, activeDrag.clientX));
            const scrollX = chart.getScrollState().x;
            setPreview({
                row: { top: activeDrag.rowTop, height: activeDrag.rowHeight },
                span: { left: activeDrag.anchorX - scrollX, width: endX - activeDrag.anchorX },
                text: `${formatDate(activeDrag.anchorX)} – ${formatDate(endX)}`,
                target: { x: activeDrag.clientX + 10, y: (pointer?.clientY ?? 0) + 12 },
            });
            return;
        }
        if (pointer && isCreateTarget(chart, pointer.target)) {
            setPreview({ text: formatDate(getTimelineX(chart, pointer.clientX)), target: { x: pointer.clientX + 10, y: pointer.clientY + 12 } });
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
            if (event.key === 'Control' && taskCreate.isEnabled()) {
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
            const target = event.ctrlKey && event.button === 0 && taskCreate.isEnabled() ? getCreateTarget(chart, event.target) : undefined;
            if (!target) {
                return;
            }
            //the chart would otherwise start dragging the bar underneath
            event.preventDefault();
            event.stopImmediatePropagation();
            setArmed(true);
            activeDragRef.current = { ...target, anchorX: getTimelineX(chart, event.clientX), clientX: event.clientX };
            updatePreview();
        },
        onMouseMove: (event: MouseEvent) => {
            pointerRef.current = { clientX: event.clientX, clientY: event.clientY, target: event.target };
            const activeDrag = activeDragRef.current;
            if (!activeDrag && !event.ctrlKey) {
                setPreview(undefined);
                return;
            }
            if (activeDrag) {
                Object.assign(activeDrag, getCreateTarget(chart, event.target), { clientX: event.clientX });
                autoScroll.sync(event.clientX);
            }
            updatePreview();
        },
        onMouseUp: () => {
            const activeDrag = activeDragRef.current;
            if (!activeDrag) {
                return;
            }
            const endX = Math.max(activeDrag.anchorX, getTimelineX(chart, activeDrag.clientX));
            if (activeDrag.rowTaskId) {
                taskCreate.create(activeDrag.rowTaskId, chart.dateFromPos(activeDrag.anchorX), chart.dateFromPos(endX));
            }
            stopDrawing();
        },
        //Ctrl+click opens the context menu on a Mac
        onContextMenu: (event: MouseEvent) => {
            if (event.ctrlKey && isCreateTarget(chart, event.target)) {
                event.preventDefault();
            }
        },
    }), []);

    useEffect(() => {
        const root = chart.$root;
        window.addEventListener('keydown', listeners.onKeyDown);
        window.addEventListener('keyup', listeners.onKeyUp);
        window.addEventListener('mousemove', listeners.onMouseMove);
        window.addEventListener('mouseup', listeners.onMouseUp);
        //captured, ahead of the chart's own mousedown
        root.addEventListener('mousedown', listeners.onMouseDown, true);
        root.addEventListener('contextmenu', listeners.onContextMenu, true);
        return () => {
            window.removeEventListener('keydown', listeners.onKeyDown);
            window.removeEventListener('keyup', listeners.onKeyUp);
            window.removeEventListener('mousemove', listeners.onMouseMove);
            window.removeEventListener('mouseup', listeners.onMouseUp);
            root.removeEventListener('mousedown', listeners.onMouseDown, true);
            root.removeEventListener('contextmenu', listeners.onContextMenu, true);
        };
    }, []);

    return preview ? <CreatePreview {...preview} /> : null;
};
