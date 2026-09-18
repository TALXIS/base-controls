import { GanttStatic } from "gantt-trial";
import { IGanttServiceLocator } from "../services";

type ScrollSource = 'grid' | 'chart';

/** Assigning `scrollTop` fires `scroll` asynchronously, so a mirrored write cannot be un-guarded at once. */
const ECHO_WINDOW_MS = 100;

export interface IGanttScrollSyncParameters {
    /** Where the chart and the grid's viewport are reached. */
    services: IGanttServiceLocator;
}

/**
 * Keeps the two halves of the split view scrolled to the same row.
 *
 * Only the side just written to ignores its next scroll — a shared guard would drop every second event of
 * a continuous scroll. Built after `gantt.init`: `$scroll_ver` is one of the elements the chart draws.
 */
export class GanttScrollSync {
    private _services: IGanttServiceLocator;
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
