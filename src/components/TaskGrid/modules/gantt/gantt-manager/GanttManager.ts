import { Gantt, GanttStatic } from 'gantt-trial';
import { IGanttServiceLocator } from '../services';
import { configureChart } from '../gantt-chart-config';
import { registerGanttColumnDefinitions, registerGanttColumns } from '../gantt-columns';
import { GanttData } from '../gantt-data';
import { GanttDates } from '../gantt-dates';
import { GanttDragging } from '../gantt-dragging';
import { GanttExpansion, IGanttExpansion } from '../gantt-expansion';
import { GanttInfiniteTimeline } from '../gantt-infinite-timeline';
import { GanttMarkers, ICustomMarker } from '../gantt-markers';
import { GanttScrollSync } from '../gantt-scroll-sync';
import { GanttSelection, IGanttSelection } from '../gantt-selection';
import { GanttZooming } from '../gantt-zooming';

/** Constructor parameters for {@link GanttManager}. */
export interface IGanttManagerParameters {
    /** Where the module's own services and the grid's are reached. */
    services: IGanttServiceLocator;
    /** Extra markers to draw on the timeline. */
    onGetCustomMarkers?: () => ICustomMarker[];
}

/**
 * Builds the chart when the timeline hands over a container, and tears it down with the control.
 *
 * Built with the modules, long before there is a grid or a container, so the two things it does at that
 * point are the two that cannot wait: putting the timeline's columns on the views before they load, and
 * registering the hook that shapes the grid's column definitions.
 *
 * Built by `createGanttModule`, never constructed directly by a consumer.
 */
export class GanttManager {
    private _services: IGanttServiceLocator;
    private _onGetCustomMarkers: () => ICustomMarker[];
    private _gantt?: GanttStatic;
    private _selection?: IGanttSelection;
    private _expansion?: IGanttExpansion;
    private _scrollSync?: GanttScrollSync;

    constructor(parameters: IGanttManagerParameters) {
        this._services = parameters.services;
        this._onGetCustomMarkers = parameters.onGetCustomMarkers ?? (() => []);
        registerGanttColumns(this._services);
        registerGanttColumnDefinitions(this._services);
        //the chart cannot exist before there is something to draw it into, and that is the timeline
        //component's to give - everything chart-shaped hangs off this
        this._services.whenAvailable('ganttContainer', container => this._start(container));
        this._registerCleanup();
    }

    /**
     * Builds the chart and its parts. The order is the contract: the chart is registered before the parts
     * are built, because they configure it; anything that listens to the elements the chart *draws* is
     * built after `init`; and the parts are registered after `init` too, because their presence is what
     * tells the rest of the module the chart can be drawn on.
     */
    private _start(container: HTMLDivElement): void {
        const gantt = Gantt.getGanttInstance();
        this._gantt = gantt;
        gantt.plugins({ drag_timeline: true, marker: true });
        configureChart(gantt, this._services);
        this._services.register('ganttChart', () => gantt);

        const dates = new GanttDates({ services: this._services });
        const timeline = new GanttInfiniteTimeline({ services: this._services });
        const dragging = new GanttDragging({ services: this._services });
        const data = new GanttData({ services: this._services });
        const zooming = new GanttZooming({ services: this._services });
        const markers = new GanttMarkers({ services: this._services, onGetCustomMarkers: this._onGetCustomMarkers });
        const selection = new GanttSelection({ services: this._services });
        const expansion = new GanttExpansion({ services: this._services });
        this._selection = selection;
        this._expansion = expansion;

        gantt.init(container);
        //after the chart drew itself, because this one listens to elements it creates. Held rather than
        //registered: nothing reaches it, it just keeps the two viewports in step
        this._scrollSync = new GanttScrollSync({ services: this._services });
        this._services.register('ganttDates', () => dates);
        this._services.register('ganttInfiniteTimeline', () => timeline);
        this._services.register('ganttDragging', () => dragging);
        this._services.register('ganttData', () => data);
        this._services.register('ganttZooming', () => zooming);
        this._services.register('ganttMarkers', () => markers);
        this._services.register('ganttSelection', () => selection);
        this._services.register('ganttExpansion', () => expansion);

        //the grid loads its records before anything renders, so they are already there to parse
        data.load();
    }

    /**
     * Releases the chart when the control it belongs to goes away. Waited for rather than resolved: the
     * module is built before the control exists.
     */
    private _registerCleanup(): void {
        this._services.get('taskGridServices').whenAvailable('datasetControl', datasetControl => {
            datasetControl.events.addEventListener('onBeforeDestroy', () => this._destroy());
        });
    }

    private _destroy(): void {
        this._expansion?.destroy();
        this._selection?.destroy();
        this._gantt?.destructor();
        this._services.destroy();
    }
}
