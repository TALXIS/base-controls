import { GanttStatic, Task } from "gantt-trial";
import { IGanttServiceLocator } from "../services";
import { isDayScaleVisible } from "../gantt-zooming";
import {
    GANTT_ROW_INACTIVE_CLASS,
    GANTT_SELECTED_ROW_CLASS,
    GANTT_TASK_SELECTED_CLASS,
    GANTT_TASK_SUMMARY_CLASS,
    WEEKEND_CLASS,
} from "../classNames";

const DEFAULT_ROW_HEIGHT = 42;

/**
 * Everything the chart is told before it is drawn: its options, its layout, its templates.
 *
 * The templates close over the locator rather than over values, because they run on every render and the
 * answers change: the selection, the hierarchy, whether weekends are shown.
 */
export const configureChart = (gantt: GanttStatic, services: IGanttServiceLocator): void => {
    gantt.config.show_grid = false;
    gantt.config.select_task = false;
    gantt.config.task_scroll_offset = 200;
    gantt.config.details_on_dblclick = false;
    gantt.config.show_links = false;
    gantt.config.drag_links = false;
    gantt.config.drag_move = false;
    gantt.config.drag_resize = false;
    gantt.config.drag_progress = false;
    gantt.config.static_background = true;
    gantt.config.scale_height = 43;
    gantt.config.scroll_size = 14;
    gantt.config.show_tasks_outside_timescale = true;
    gantt.config.row_height = services.get('taskGridServices').get('datasetControl').getParameters().RowHeight?.raw ?? DEFAULT_ROW_HEIGHT;
    //the grid owns the vertical scrollbar of the split view, so only the timeline's own is laid out
    gantt.config.layout = {
        css: 'gantt_container',
        rows: [
            {
                cols: [
                    { view: 'timeline', scrollX: 'scrollHor', scrollY: 'scrollVer' },
                    { view: 'scrollbar', id: 'scrollVer' },
                ],
            },
            { view: 'scrollbar', id: 'scrollHor', height: 20 },
        ],
    };
    gantt.templates.timeline_cell_class = (_task, date) => getWeekendClass(gantt, date, services);
    gantt.templates.task_row_class = (_start, _end, task) => getTaskRowClass(task, services);
    gantt.templates.task_class = (_start, _end, task) => getTaskClass(task, services);
    //the bar carries no text of its own: the name is drawn beside it, where it stays readable at any
    //zoom level
    gantt.templates.task_text = () => '';
    gantt.templates.leftside_text = (_start, _end, task) => task.text;
    applyWeekendVisibility(gantt, services);
};

/**
 * Weekends are dropped from the scale rather than hidden, so the bars close up over them.
 *
 * Applied again whenever the setting changes, which is why it is exported.
 */
export const applyWeekendVisibility = (gantt: GanttStatic, services: IGanttServiceLocator): void => {
    gantt.ignore_time = date => !services.get('ganttViewState').isWeekendVisible() && isWeekend(date) && isDayScaleVisible(gantt);
};

const getWeekendClass = (gantt: GanttStatic, date: Date, services: IGanttServiceLocator): string | undefined => {
    return services.get('ganttViewState').isWeekendVisible() && isWeekend(date) && isDayScaleVisible(gantt)
        ? WEEKEND_CLASS
        : undefined;
};

const getTaskRowClass = (task: Task, services: IGanttServiceLocator): string => {
    return [
        ...(task.active ? [] : [GANTT_ROW_INACTIVE_CLASS]),
        ...(isSelected(task, services) ? [GANTT_SELECTED_ROW_CLASS] : []),
    ].join(' ');
};

const getTaskClass = (task: Task, services: IGanttServiceLocator): string => {
    const taskDataProvider = services.get('taskGridServices').get('taskDataProvider');
    return [
        ...(taskDataProvider.getRecordTree().view.hasChildren(task.id as string) ? [GANTT_TASK_SUMMARY_CLASS] : []),
        ...(isSelected(task, services) ? [GANTT_TASK_SELECTED_CLASS] : []),
    ].join(' ');
};

const isSelected = (task: Task, services: IGanttServiceLocator): boolean => {
    return services.get('taskGridServices').get('taskDataProvider').getSelectedRecordIds().includes(task.id as string);
};

const isWeekend = (date: Date): boolean => {
    return date.getDay() === 0 || date.getDay() === 6;
};
