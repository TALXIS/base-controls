import type { GanttStatic } from "dhtmlx-gantt";

interface IBarBox {
    top: number;
    left: number;
    width: number;
}

//Fluent's decelerate curve and a medium duration
const MOTION = { duration: 300, easing: 'cubic-bezier(0.1, 0.9, 0.2, 1)' };
//past this many moving bars the slide costs more than it shows
const MAX_ANIMATED_BARS = 150;

/** Slides bars to where new dates put them, instead of letting them jump there. */
export class GanttTaskMotion {
    private _gantt: GanttStatic;

    constructor(gantt: GanttStatic) {
        this._gantt = gantt;
    }

    /** Where the tasks' bars are drawn now, to slide them from once they are redrawn. */
    public capture(taskIds: string[]): Map<string, IBarBox> {
        const boxes = new Map<string, IBarBox>();
        if (!this._isEnabled()) {
            return boxes;
        }
        for (const taskId of taskIds) {
            const box = this._getBox(taskId);
            if (box) {
                boxes.set(taskId, box);
            }
        }
        return boxes;
    }

    /** Slides each redrawn bar from where `capture` found it, unless it changed rows. */
    public play(before: Map<string, IBarBox>): void {
        const moves: [HTMLElement, IBarBox, IBarBox][] = [];
        before.forEach((from, taskId) => {
            const bar = this._getBar(taskId);
            const to = bar && toBox(bar);
            if (bar && to && to.top === from.top && (Math.abs(to.left - from.left) > 0.5 || Math.abs(to.width - from.width) > 0.5)) {
                moves.push([bar, from, to]);
            }
        });
        if (moves.length > MAX_ANIMATED_BARS) {
            return;
        }
        for (const [bar, from, to] of moves) {
            bar.animate([{ left: `${from.left}px`, width: `${from.width}px` }, { left: `${to.left}px`, width: `${to.width}px` }], MOTION);
        }
    }

    //a bar being dragged follows the pointer
    private _isEnabled(): boolean {
        const window = this._gantt.$root?.ownerDocument.defaultView;
        return !!window && !this._gantt.getState().drag_id && !window.matchMedia('(prefers-reduced-motion: reduce)').matches;
    }

    private _getBox(taskId: string): IBarBox | undefined {
        const bar = this._getBar(taskId);
        return bar ? toBox(bar) : undefined;
    }

    private _getBar(taskId: string): HTMLElement | undefined {
        return this._gantt.isTaskExists(taskId) ? this._gantt.getTaskNode(taskId) ?? undefined : undefined;
    }
}

const toBox = (bar: HTMLElement): IBarBox => ({ top: bar.offsetTop, left: bar.offsetLeft, width: bar.offsetWidth });
