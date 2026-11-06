import type { GanttStatic, Task } from "dhtmlx-gantt";

/** The chart's state of a bar being dragged, measured from the rendered range's start. */
export interface IBarDragState {
    /** The task as it was when the drag began. */
    obj?: Task;
    /** Whether a resize drags the start. */
    left?: boolean;
    start_x?: number;
    pos?: { x: number; y: number };
    obj_s_x?: number;
    obj_e_x?: number;
}

interface IScaleConfig {
    count: number;
    trace_x: Date[];
    ignore_x: Record<number, boolean>;
    display_count: number;
}

interface ITimelineDragScroll {
    _mouseDown?: boolean;
    _scrollState?: { x: number; y: number };
}

interface IDatastore {
    filter(): void;
    _skipTaskRecalculation?: boolean | string;
}

interface IView {
    _timelineDragScroll?: ITimelineDragScroll | null;
    _tasks_dnd?: { drag: IBarDragState | null };
    $scaleHelper?: { processIgnores(scale: IScaleConfig): void };
    _oldLeft?: number;
    $scroll_hor?: HTMLElement;
    $scroll_ver?: HTMLElement;
}

interface IChartInternals {
    $ui?: { getView(id: 'timeline' | 'scrollHor' | 'scrollVer'): IView | undefined };
    $services: { getService(name: 'datastores'): string[] };
    getDatastore(name: string): IDatastore;
    $data: { tasksStore: IDatastore };
}

const getInternals = (chart: GanttStatic): IChartInternals => chart as unknown as IChartInternals;

const getView = (chart: GanttStatic, id: 'timeline' | 'scrollHor' | 'scrollVer'): IView | undefined => getInternals(chart).$ui?.getView(id);

export const getHorizontalScrollbar = (chart: GanttStatic): HTMLElement | undefined => getView(chart, 'scrollHor')?.$scroll_hor;

export const getVerticalScrollbar = (chart: GanttStatic): HTMLElement | undefined => getView(chart, 'scrollVer')?.$scroll_ver;

/** Makes the next wheel step scroll on from where the chart is now. */
export const syncWheelScrollOrigin = (chart: GanttStatic): void => {
    const scrollbar = getView(chart, 'scrollHor');
    if (scrollbar?.$scroll_hor) {
        scrollbar._oldLeft = scrollbar.$scroll_hor.scrollLeft;
    }
};

/** Moves a running drag of the timeline by `offset` pixels, in place. */
export const shiftTimelineDrag = (chart: GanttStatic, offset: number): void => {
    const drag = getView(chart, 'timeline')?._timelineDragScroll;
    if (drag?._mouseDown && drag._scrollState && offset) {
        drag._scrollState.x += offset;
    }
};

/** Renders without refiltering the stores or recalculating summary tasks. */
export const renderGeometry = (chart: GanttStatic): void => {
    const internals = getInternals(chart);
    const stores = internals.$services.getService('datastores').map(name => internals.getDatastore(name));
    const ownFilters = stores.map(store => Object.prototype.hasOwnProperty.call(store, 'filter') ? store.filter : undefined);
    stores.forEach(store => store.filter = () => { });
    internals.$data.tasksStore._skipTaskRecalculation = true;
    try {
        chart.render();
    }
    finally {
        stores.forEach((store, index) => {
            const ownFilter = ownFilters[index];
            if (ownFilter) {
                store.filter = ownFilter;
            }
            else {
                delete (store as Partial<IDatastore>).filter;
            }
        });
        internals.$data.tasksStore._skipTaskRecalculation = false;
    }
};

/** Replaces the chart's sibling-scanning index lookup. */
export const setTaskIndexResolver = (chart: GanttStatic, getIndex: (taskId: string) => number): void => {
    chart.getTaskIndex = (taskId: string | number) => getIndex(String(taskId));
};

/**
 * Widens which tasks the chart treats as visible.
 * @returns Puts back the chart's own check.
 */
export const extendTaskVisibility = (chart: GanttStatic, isVisible: (taskId: string | number) => boolean): () => void => {
    const original = chart.isTaskVisible;
    const isOriginallyVisible = original.bind(chart);
    chart.isTaskVisible = (taskId: string | number) => isOriginallyVisible(taskId) || isVisible(taskId);
    return () => chart.isTaskVisible = original;
};

export const getBarDragState = (chart: GanttStatic): IBarDragState | undefined => {
    return getView(chart, 'timeline')?._tasks_dnd?.drag ?? undefined;
};

/** Moves a running bar drag's measurements by `offset` pixels. */
export const shiftBarDrag = (chart: GanttStatic, offset: number): void => {
    const drag = getBarDragState(chart);
    if (!drag || !offset) {
        return;
    }
    if (drag.start_x !== undefined) {
        drag.start_x += offset;
    }
    if (drag.pos) {
        drag.pos.x += offset;
    }
    if (drag.obj_s_x !== undefined) {
        drag.obj_s_x += offset;
    }
    if (drag.obj_e_x !== undefined) {
        drag.obj_e_x += offset;
    }
};

/** Gives the scale columns whose dates match no width, on every scale rebuild. */
export const setScaleIgnores = (chart: GanttStatic, isIgnored: (date: Date) => boolean): void => {
    const scaleHelper = getView(chart, 'timeline')?.$scaleHelper;
    if (!scaleHelper) {
        throw new Error('The Gantt timeline has no scale helper to hide columns with.');
    }
    scaleHelper.processIgnores = scale => {
        const ignored = scale.trace_x.filter(isIgnored);
        //a scale of only ignored columns would have no width to lay out
        const isAllIgnored = ignored.length >= scale.count;
        scale.ignore_x = {};
        if (!isAllIgnored) {
            ignored.forEach(date => scale.ignore_x[date.valueOf()] = true);
        }
        scale.display_count = scale.count - Object.keys(scale.ignore_x).length;
    };
};
