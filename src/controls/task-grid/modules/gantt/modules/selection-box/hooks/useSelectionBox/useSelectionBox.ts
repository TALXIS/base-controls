import Selecto, { OnDragEnd, OnDragStart, OnScroll, OnSelect } from "selecto";
import { useCallback, useEffect, useRef } from "react";
import { useGanttService, useGanttServices } from '../../../../context';
import {
    GANTT_TASK_SELECTED_CLASS,
    GANTT_TASK_LINE_CLASS,
    GANTT_TASK_SIDE_CONTENT_CLASS,
} from '../../../../classNames';
import { getSelectionBoxCursorStyles } from '../../styles';

const EDGE_SCROLL_THRESHOLD = 50;

//one class for the whole module: mergeStyles hands back the same one for the same rules
const CURSOR_CLASS = getSelectionBoxCursorStyles();

/**
 * Rubber-band selection over the chart, on shift-drag.
 *
 * Waits for the chart itself: `Selecto` binds to `$task`, which only exists once the chart is drawn.
 */
export const useSelectionBox = () => {
    const services = useGanttServices();
    const gantt = useGanttService('ganttChart');
    const dragging = useGanttService('ganttDragging');
    const selection = useGanttService('ganttSelection');
    const selectoRef = useRef<Selecto>();
    const selectedRecordIdsRef = useRef<Set<string>>(new Set());
    const blockDeselectionRef = useRef<boolean>(false);

    const getTaskElementFromElement = (el: Element): HTMLElement => {
        const taskElement = el.closest('[data-task-id]');
        if (!taskElement) {
            throw new Error('Could not find an ancestor with data-task-id for the selected gantt element.');
        }

        return taskElement as HTMLElement;
    }

    //resolved here rather than closed over: the key handlers below are built once, when there is no chart
    //yet and so no dragging part either
    const setSelectionMode = (enabled: boolean) => {
        const chart = services.find('ganttChart');
        const chartDragging = services.find('ganttDragging');
        if (!chart || !chartDragging) {
            return;
        }
        chartDragging.setDraggingDisabled(enabled);
        chart.$root.classList.toggle(CURSOR_CLASS, enabled);
    };

    const start = () => {
        if (!gantt) {
            return;
        }
        const container = gantt.$task;
        selectoRef.current = new Selecto({
            container: container,
            hitRate: 0,
            selectableTargets: [`.${GANTT_TASK_LINE_CLASS}`, `.${GANTT_TASK_SIDE_CONTENT_CLASS}`],
            scrollOptions: {
                container: container,
                throttleTime: 30,
                threshold: EDGE_SCROLL_THRESHOLD,
                getScrollPosition: () => [gantt.$scroll_hor.scrollLeft, gantt.$scroll_ver.scrollTop],
            }

        });
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('keydown', onKeyDown);
        selectoRef.current.on('select', onSelect);
        selectoRef.current.on('scroll', onScroll);
        selectoRef.current.on('dragStart', onDragStart);
        selectoRef.current.on('dragEnd', onDragEnd);
    }

    const onKeyUp = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Shift') {
            setSelectionMode(false);
        }
    }, []);

    const onKeyDown = useCallback((e: KeyboardEvent) => {
        if (e.key === 'Shift') {
            setSelectionMode(true);
        }
    }, []);

    const onSelect = (e: OnSelect<Selecto>) => {
        e.added.forEach(el => {
            const taskElement = getTaskElementFromElement(el);
            const taskId = taskElement.getAttribute('data-task-id')!;

            taskElement.classList.add(GANTT_TASK_SELECTED_CLASS);
            selectedRecordIdsRef.current.add(taskId);
        });
        if (!blockDeselectionRef.current) {
            e.removed.forEach(el => {
                const taskElement = getTaskElementFromElement(el);
                const taskId = taskElement.getAttribute('data-task-id')!;

                taskElement.classList.remove(GANTT_TASK_SELECTED_CLASS);
                selectedRecordIdsRef.current.delete(taskId);
            });
        }
    };

    const onDragEnd = (e: OnDragEnd<Selecto>) => {
        //the selection part owns every write to the grid's selection; the box only says which tasks
        selection?.applySelection(Array.from(selectedRecordIdsRef.current));
        selectedRecordIdsRef.current.clear();
        setSelectionMode(!!e.inputEvent?.shiftKey);
    }

    const onDragStart = (e: OnDragStart<Selecto>) => {
        if (!e.inputEvent.shiftKey) {
            setSelectionMode(false);
            e.stop();
            return;
        }

        setSelectionMode(true);
    };

    const onScroll = (e: OnScroll) => {
        if (!gantt) {
            return;
        }
        const [horizontalDirection, verticalDirection] = e.direction;

        if (verticalDirection !== 0) {
            gantt.scrollTo(null, gantt.getScrollState().y + (verticalDirection * 10));
        }

        if (horizontalDirection !== 0) {
            gantt.scrollTo(gantt.getScrollState().x + (horizontalDirection * 10), null);
        }

        selectoRef.current?.findSelectableTargets();
        blockDeselectionRef.current = true;
        setTimeout(() => {
            blockDeselectionRef.current = false;
        }, 0);
    }

    //both, not just the chart: `$task` exists once the chart is initialised, which is exactly when the
    //manager registers its parts
    useEffect(() => {
        if (!gantt || !dragging) {
            return;
        }
        start();
        return () => {
            selectoRef.current?.destroy();
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('keydown', onKeyDown);
            setSelectionMode(false);
        }
    }, [gantt, dragging]);
}