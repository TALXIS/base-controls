import { useEffect, useRef } from "react";
import { GanttStatic } from "gantt-trial";

const EDGE_THRESHOLD = 50;
const SCROLL_STEP = 10;
const SCROLL_INTERVAL_MS = 30;

/** What {@link useTimelineAutoScroll} needs. */
export interface IUseTimelineAutoScrollParams {
    /** `undefined` until the chart is live; the loop simply does not run before that. */
    gantt?: GanttStatic;
    /** Whether scrolling further left is still useful — a drag cannot shrink past where it started. */
    canScrollLeft: () => boolean;
    /** Called after every step, so whatever is being dragged can follow the new scroll position. */
    onScrolled: () => void;
}

/**
 * Scrolls the timeline while the pointer sits against either edge of it.
 *
 * Driven by `sync`, which the pointer handler calls with each new x — the direction is derived from how
 * close that is to an edge, and the loop stops on its own once there is nothing left to scroll.
 */
export const useTimelineAutoScroll = (params: IUseTimelineAutoScrollParams) => {
    const { gantt, canScrollLeft, onScrolled } = params;
    const intervalRef = useRef<number | null>(null);
    const directionRef = useRef<-1 | 0 | 1>(0);

    const stop = () => {
        if (intervalRef.current !== null) {
            window.clearInterval(intervalRef.current);
            intervalRef.current = null;
        }
        directionRef.current = 0;
    };

    const start = () => {
        if (intervalRef.current !== null || !gantt) {
            return;
        }
        intervalRef.current = window.setInterval(() => {
            const direction = directionRef.current;
            if (direction === 0) {
                return;
            }
            if (direction < 0 && !canScrollLeft()) {
                stop();
                onScrolled();
                return;
            }

            const scrollX = gantt.getScrollState().x;
            const nextScrollX = Math.max(0, scrollX + (direction * SCROLL_STEP));
            //already at the end: nothing to scroll, so the loop has done its job
            if (nextScrollX === scrollX) {
                stop();
                onScrolled();
                return;
            }

            gantt.scrollTo(nextScrollX, null);
            onScrolled();
        }, SCROLL_INTERVAL_MS);
    };

    /** Points the loop at whichever edge the pointer is against, or stops it when it is against neither. */
    const sync = (clientX: number) => {
        if (!gantt) {
            return;
        }
        const taskRect = gantt.$task.getBoundingClientRect();
        const direction: -1 | 0 | 1 = clientX >= taskRect.right - EDGE_THRESHOLD
            ? 1
            : clientX <= taskRect.left + EDGE_THRESHOLD && canScrollLeft() ? -1 : 0;

        if (direction === 0) {
            stop();
            return;
        }
        directionRef.current = direction;
        start();
    };

    useEffect(() => stop, []);

    return { sync, stop };
};
