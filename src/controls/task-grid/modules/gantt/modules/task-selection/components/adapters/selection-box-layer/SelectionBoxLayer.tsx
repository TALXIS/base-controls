import { useEffect } from "react";
import Selecto, { OnDragEnd, OnDragStart, OnScroll, OnSelect } from "selecto";
import { useGanttModule, useGanttService } from "../../../../../context";
import { GANTT_TASK_ID_ATTRIBUTE, GANTT_TASK_LINE_CLASS } from "../../../../../chart";
import { ROW_SELECTED_CLASS, SELECTION_ARMED_CLASS, SELECTION_BOX_CLASS, BAR_SELECTED_CLASS } from "../../../classNames";

const EDGE_SCROLL_THRESHOLD = 50;
const SCROLL_STEP = 10;

/** Shift+drag selects the bars under a band that `Selecto` draws. */
export const SelectionBoxLayer = () => {
    const chart = useGanttService('chart');
    const dragging = useGanttService('dragging');
    const selection = useGanttModule('taskSelection');

    useEffect(() => {
        if (!chart || !dragging) {
            return;
        }
        const selectedTaskIds = new Set<string>();
        let isDeselectionBlocked = false;
        let isBandOpen = false;
        let unblockDeselectionTimeout: ReturnType<typeof setTimeout> | undefined;
        let releaseDragging: (() => void) | undefined;

        const setArmed = (isArmed: boolean) => {
            if (isArmed) {
                releaseDragging ??= dragging.disableDragging();
            }
            else {
                releaseDragging?.();
                releaseDragging = undefined;
            }
            chart.$root?.classList.toggle(SELECTION_ARMED_CLASS, isArmed);
        };
        const getTaskId = (element: Element) => element.closest(`[${GANTT_TASK_ID_ATTRIBUTE}]`)?.getAttribute(GANTT_TASK_ID_ATTRIBUTE) ?? undefined;
        //drawn as selected while the band is open, until the selection redraws the chart
        const setHighlighted = (taskId: string, isHighlighted: boolean) => {
            chart.$root?.querySelectorAll(`[${GANTT_TASK_ID_ATTRIBUTE}="${CSS.escape(taskId)}"]`).forEach(element => {
                element.classList.toggle(element.classList.contains(GANTT_TASK_LINE_CLASS) ? BAR_SELECTED_CLASS : ROW_SELECTED_CLASS, isHighlighted);
            });
        };
        const onKeyDown = (event: KeyboardEvent) => event.key === 'Shift' && setArmed(true);
        const onKeyUp = (event: KeyboardEvent) => event.key === 'Shift' && setArmed(false);
        const onBlur = () => setArmed(false);
        //a keyup outside the page never arrives
        const onMouseMove = (event: MouseEvent) => !event.shiftKey && !isBandOpen && setArmed(false);

        const selecto = new Selecto({
            container: chart.$task,
            className: SELECTION_BOX_CLASS,
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
                return;
            }
            isBandOpen = true;
        });
        selecto.on('select', (event: OnSelect<Selecto>) => {
            for (const element of event.added) {
                const taskId = getTaskId(element);
                if (taskId) {
                    selectedTaskIds.add(taskId);
                    setHighlighted(taskId, true);
                }
            }
            //a scroll step re-reads the targets and would drop what scrolled out of view
            if (!isDeselectionBlocked) {
                for (const element of event.removed) {
                    const taskId = getTaskId(element);
                    if (taskId) {
                        selectedTaskIds.delete(taskId);
                        setHighlighted(taskId, false);
                    }
                }
            }
        });
        selecto.on('scroll', (event: OnScroll) => {
            const [horizontal, vertical] = event.direction;
            const { x, y } = chart.getScrollState();
            chart.scrollTo(x + horizontal * SCROLL_STEP, y + vertical * SCROLL_STEP);
            isDeselectionBlocked = true;
            selecto.findSelectableTargets();
            //the chart draws the bars that scrolled into view afresh
            selectedTaskIds.forEach(taskId => setHighlighted(taskId, true));
            clearTimeout(unblockDeselectionTimeout);
            unblockDeselectionTimeout = setTimeout(() => isDeselectionBlocked = false);
        });
        selecto.on('dragEnd', (event: OnDragEnd<Selecto>) => {
            selection.select([...selectedTaskIds]);
            selectedTaskIds.clear();
            isBandOpen = false;
            setArmed(!!event.inputEvent?.shiftKey);
        });
        window.addEventListener('keydown', onKeyDown);
        window.addEventListener('keyup', onKeyUp);
        window.addEventListener('blur', onBlur);
        window.addEventListener('mousemove', onMouseMove);
        return () => {
            selecto.destroy();
            clearTimeout(unblockDeselectionTimeout);
            window.removeEventListener('keydown', onKeyDown);
            window.removeEventListener('keyup', onKeyUp);
            window.removeEventListener('blur', onBlur);
            window.removeEventListener('mousemove', onMouseMove);
            setArmed(false);
        };
    }, [chart, dragging, selection]);

    return null;
};
