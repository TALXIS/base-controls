import { useEffect } from "react";
import Selecto, { OnDragEnd, OnDragStart, OnScroll, OnSelect } from "selecto";
import { mergeStyles } from "@fluentui/react";
import { useGanttModule, useGanttService } from "../../../../../context";
import { GANTT_TASK_ID_ATTRIBUTE, GANTT_TASK_LINE_CLASS } from "../../../../../chart/classNames";

const EDGE_SCROLL_THRESHOLD = 50;
const SCROLL_STEP = 10;

//doubled to outweigh the chart's grab cursors while the next drag draws a band
const SELECT_CURSOR_CLASS = mergeStyles({ selectors: { '&&, && *': { cursor: 'crosshair' } } });

/** Shift+drag selects the bars under a band; `Selecto` draws the band itself. */
export const SelectionBoxLayer = () => {
    const chart = useGanttService('chart');
    const dragging = useGanttService('dragging');
    const selection = useGanttModule('selection');

    useEffect(() => {
        if (!chart || !dragging) {
            return;
        }
        const selectedTaskIds = new Set<string>();
        let isDeselectionBlocked = false;

        const setArmed = (isArmed: boolean) => {
            dragging.setDraggingDisabled(isArmed);
            chart.$root?.classList.toggle(SELECT_CURSOR_CLASS, isArmed);
        };
        const getTaskId = (element: Element) => element.closest(`[${GANTT_TASK_ID_ATTRIBUTE}]`)?.getAttribute(GANTT_TASK_ID_ATTRIBUTE) ?? undefined;
        const onKeyDown = (event: KeyboardEvent) => event.key === 'Shift' && setArmed(true);
        const onKeyUp = (event: KeyboardEvent) => event.key === 'Shift' && setArmed(false);

        const selecto = new Selecto({
            container: chart.$task,
            hitRate: 0,
            selectableTargets: [`.${GANTT_TASK_LINE_CLASS}`],
            scrollOptions: {
                container: chart.$task,
                throttleTime: 30,
                threshold: EDGE_SCROLL_THRESHOLD,
                getScrollPosition: () => [chart.getScrollState().x, chart.getScrollState().y],
            },
        });
        selecto.on('dragStart', (event: OnDragStart<Selecto>) => {
            if (!event.inputEvent.shiftKey) {
                event.stop();
            }
        });
        selecto.on('select', (event: OnSelect<Selecto>) => {
            for (const element of event.added) {
                const taskId = getTaskId(element);
                taskId && selectedTaskIds.add(taskId);
            }
            //a scroll step re-reads the targets, which would drop what scrolled out of view
            if (!isDeselectionBlocked) {
                for (const element of event.removed) {
                    const taskId = getTaskId(element);
                    taskId && selectedTaskIds.delete(taskId);
                }
            }
        });
        selecto.on('scroll', (event: OnScroll) => {
            const [horizontal, vertical] = event.direction;
            const { x, y } = chart.getScrollState();
            chart.scrollTo(x + horizontal * SCROLL_STEP, y + vertical * SCROLL_STEP);
            isDeselectionBlocked = true;
            selecto.findSelectableTargets();
            setTimeout(() => isDeselectionBlocked = false);
        });
        selecto.on('dragEnd', (event: OnDragEnd<Selecto>) => {
            selection.select([...selectedTaskIds]);
            selectedTaskIds.clear();
            setArmed(!!event.inputEvent?.shiftKey);
        });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        return () => {
            selecto.destroy();
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            setArmed(false);
        };
    }, [chart, dragging, selection]);

    return null;
};
