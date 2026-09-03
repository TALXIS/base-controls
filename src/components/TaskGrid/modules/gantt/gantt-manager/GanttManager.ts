import { Gantt, GanttStatic } from 'gantt-trial';
import { IGanttServiceLocator } from '../services';
import { configureChart } from '../gantt-chart-config';
import { registerGanttColumnDefinitions, registerGanttColumns } from '../gantt-columns';
import { GanttData } from '../gantt-data';
import { GanttDates } from '../gantt-dates';
import { GanttDragging } from '../gantt-dragging';
import { GanttExpansion, IGanttExpansion } from '../gantt-expansion';
import { GanttInfiniteTimeline } from '../gantt-infinite-timeline';
import { GanttScrollSync } from '../gantt-scroll-sync';
import { GanttSelection, IGanttSelection } from '../gantt-selection';
import { GanttZooming } from '../gantt-zooming';

export interface IGanttManagerParameters {
    /** Where the module's own services and the grid's are reached. */
    services: IGanttServiceLocator;
}

/** Builds the chart when the timeline hands over a container, and tears it down with the control. */
export class GanttManager {
    private _services: IGanttServiceLocator;
    private _gantt?: GanttStatic;
    private _selection?: IGanttSelection;
    private _expansion?: IGanttExpansion;
    private _scrollSync?: GanttScrollSync;

    constructor(parameters: IGanttManagerParameters) {
        this._services = parameters.services;
        registerGanttColumns(this._services);
        registerGanttColumnDefinitions(this._services);
        //the chart cannot exist before there is something to draw it into, and that is the timeline
        //component's to give - everything chart-shaped hangs off this
        this._services.whenAvailable('ganttContainer', container => this._start(container));
        this._registerCleanup();
    }

    //the order is the contract: the chart is registered before the parts that configure it, anything
    //listening to elements it draws is built after init, and the parts are registered after init because
    //their presence is what says the chart can be drawn on
    private _start(container: HTMLDivElement): void {
        const gantt = Gantt.getGanttInstance();
        this._gantt = gantt;
        gantt.plugins({ drag_timeline: true });
        configureChart(gantt, this._services);

        //the zoom levels are built from what the date columns hold, so this one is in place before the
        //parts that read it - it needs nothing from the chart itself
        const dates = new GanttDates({ services: this._services });
        this._services.register('ganttDates', () => dates);
        this._services.register('ganttChart', () => gantt);

        const timeline = new GanttInfiniteTimeline({ services: this._services });
        const dragging = new GanttDragging({ services: this._services });
        const data = new GanttData({ services: this._services });
        const zooming = new GanttZooming({ services: this._services });
        const selection = new GanttSelection({ services: this._services });
        const expansion = new GanttExpansion({ services: this._services });
        this._selection = selection;
        this._expansion = expansion;

        gantt.init(container);
        //after the chart drew itself, because this one listens to elements it creates. Held rather than
        //registered: nothing reaches it, it just keeps the two viewports in step
        this._scrollSync = new GanttScrollSync({ services: this._services });
        this._services.register('ganttInfiniteTimeline', () => timeline);
        this._services.register('ganttDragging', () => dragging);
        this._services.register('ganttData', () => data);
        this._services.register('ganttZooming', () => zooming);
        this._services.register('ganttSelection', () => selection);
        this._services.register('ganttExpansion', () => expansion);

        //the grid loads its records before anything renders, so they are already there to parse
        data.load();
        //the markers module registered its provider when the chart appeared; its markers load here rather
        //than from inside it, the way the grid drives its own providers' first load
        this._services.find('ganttMarkers')?.refresh();
    }

    //releases the chart when the control it belongs to goes away. Waited for rather than resolved: the module is built
    //before the control exists.
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
