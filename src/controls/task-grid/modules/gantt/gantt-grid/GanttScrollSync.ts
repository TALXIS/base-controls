import { GanttStatic } from "gantt-trial";

type ScrollSource = 'grid' | 'chart';

/** Assigning `scrollTop` fires `scroll` asynchronously, so a mirrored write cannot be un-guarded at once. */
const ECHO_WINDOW_MS = 100;

export interface IGanttScrollSyncParameters {
    chart: GanttStatic;
    /** The element the grid's rows scroll in. */
    gridViewport: HTMLElement;
}

/**
 * Keeps the two halves of the split view scrolled to the same row.
 *
 * Only the side just written to ignores its next scroll — a shared guard would drop every second event of
 * a continuous scroll.
 */
export class GanttScrollSync {
    private _chartViewport: HTMLElement;
    private _gridViewport: HTMLElement;
    private _echoUntil: Record<ScrollSource, number> = { grid: 0, chart: 0 };

    constructor(parameters: IGanttScrollSyncParameters) {
        this._chartViewport = parameters.chart.$scroll_ver;
        this._gridViewport = parameters.gridViewport;
        this._chartViewport.addEventListener('scroll', this._onChartScrolled);
        this._gridViewport.addEventListener('scroll', this._onGridScrolled);
    }

    public destroy(): void {
        this._chartViewport.removeEventListener('scroll', this._onChartScrolled);
        this._gridViewport.removeEventListener('scroll', this._onGridScrolled);
    }

    private _onChartScrolled = (event: Event): void => this._onScrolled('chart', event);

    private _onGridScrolled = (event: Event): void => this._onScrolled('grid', event);

    private _onScrolled(source: ScrollSource, event: Event): void {
        if (Date.now() < this._echoUntil[source]) {
            this._echoUntil[source] = 0;
            return;
        }
        const target: ScrollSource = source === 'grid' ? 'chart' : 'grid';
        this._echoUntil[target] = Date.now() + ECHO_WINDOW_MS;
        (target === 'chart' ? this._chartViewport : this._gridViewport).scrollTop = (event.target as Element).scrollTop;
    }
}
