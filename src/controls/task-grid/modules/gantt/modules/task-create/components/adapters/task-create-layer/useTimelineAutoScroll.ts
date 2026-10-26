import { useEffect, useRef } from "react";
import type { GanttStatic } from "dhtmlx-gantt";

const EDGE_THRESHOLD = 50;
const SCROLL_STEP = 10;
const SCROLL_INTERVAL = 30;

/** Scrolls the timeline while the pointer is against either of its edges. */
export const useTimelineAutoScroll = (gantt: GanttStatic, canScrollLeft: () => boolean, onScrolled: () => void) => {
    const intervalRef = useRef<number>();
    const directionRef = useRef<-1 | 0 | 1>(0);

    const stop = () => {
        window.clearInterval(intervalRef.current);
        intervalRef.current = undefined;
        directionRef.current = 0;
    };

    const step = () => {
        const direction = directionRef.current;
        const scrollX = gantt.getScrollState().x;
        const nextScrollX = Math.max(0, scrollX + direction * SCROLL_STEP);
        if ((direction < 0 && !canScrollLeft()) || nextScrollX === scrollX) {
            stop();
        }
        else {
            gantt.scrollTo(nextScrollX, null);
        }
        onScrolled();
    };

    /** Points the scrolling at the edge the pointer is against, or stops it. */
    const sync = (clientX: number) => {
        const taskRect = gantt.$task.getBoundingClientRect();
        const direction = clientX >= taskRect.right - EDGE_THRESHOLD ? 1 : clientX <= taskRect.left + EDGE_THRESHOLD && canScrollLeft() ? -1 : 0;
        if (direction === 0) {
            stop();
            return;
        }
        directionRef.current = direction;
        intervalRef.current ??= window.setInterval(step, SCROLL_INTERVAL);
    };

    useEffect(() => stop, []);

    return { sync, stop };
};
