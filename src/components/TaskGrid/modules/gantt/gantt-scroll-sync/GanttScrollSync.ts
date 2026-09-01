import { GanttStatic } from "gantt-trial";
import { IGanttServiceLocator } from "../services";

/** Which half of the split view a scroll came from. */
type ScrollSource = 'grid' | 'chart';

/**
 * How long a mirrored scroll stays ignored on the side it was written to. Assigning `scrollTop` fires
 * `scroll` asynchronously, so the guard cannot be released right after the write.
 */
const ECHO_WINDOW_MS = 100;

/** Constructor parameters for {@link GanttScrollSync}. */
export interface IGanttScrollSyncParameters {
    /** Where the chart and the grid's viewport are reached. */
    services: IGanttServiceLocator;
}

/**
 * Keeps the two halves of the split view scrolled to the same row.
 *
 * The grid owns the vertical scrollbar the user sees; the chart has its own. Each side's scroll is written
 * to the other, and only the side just written to ignores its next scroll — a shared guard would drop
 * every second event of a continuous scroll.
 *
 * Built after `gantt.init`, because `$scroll_ver` is one of the elements the chart creates as it draws.
 * The grid's viewport is waited for rather than assumed: `gridApi` arriving is what says AG Grid has one.
 */
export class GanttScrollSync {
    private _services: IGanttServiceLocator;
    /** Until when each side's next scroll is the echo of a write, and not the user. */
    private _echoUntil: Record<ScrollSource, number> = { grid: 0, chart: 0 };

    constructor(parameters: IGanttScrollSyncParameters) {
        this._services = parameters.services;
        this._chart.$scroll_ver.addEventListener('scroll', event => this._onScrolled('chart', event));
        this._services.get('taskGridServices').whenAvailable('gridApi', () => {
            this._getGridViewport().addEventListener('scroll', event => this._onScrolled('grid', event));
        });
    }

    private _onScrolled(source: ScrollSource, event: Event): void {
        if (Date.now() < this._echoUntil[source]) {
            this._echoUntil[source] = 0;
            return;
        }
        const target: ScrollSource = source === 'grid' ? 'chart' : 'grid';
        this._echoUntil[target] = Date.now() + ECHO_WINDOW_MS;
        this._getElement(target).scrollTop = (event.target as Element).scrollTop;
    }

    private _getElement(source: ScrollSource): HTMLElement {
        return source === 'chart' ? this._chart.$scroll_ver : this._getGridViewport();
    }

    /** The grid's own scrolling element — the one the timeline's scrolling is mirrored onto. */
    private _getGridViewport(): HTMLElement {
        const controlId = this._services.get('taskGridServices').get('datasetControl').getControlId();
        const rootElement = document.getElementById(`${controlId}-root`);
        const viewport = rootElement?.querySelector('.ag-body-viewport');
        if (!(viewport instanceof HTMLElement)) {
            throw new Error('AgGrid vertical viewport not found');
        }

        return viewport;
    }

    private get _chart(): GanttStatic {
        return this._services.get('ganttChart');
    }
}
