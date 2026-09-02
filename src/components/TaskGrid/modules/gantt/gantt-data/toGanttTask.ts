import { IRecord } from "@talxis/client-libraries";
import { Task } from "gantt-trial";
import { IGanttServiceLocator } from "../services";

/** Bar heights: a summary task is drawn as a thin span over its children, a leaf as a full bar. */
const SUMMARY_BAR_HEIGHT = 16;
const TASK_BAR_HEIGHT = 26;

/**
 * One task record as the chart's own task.
 *
 * The record is read through the module's field mapping and the grid's hierarchy, so what the chart shows
 * follows what the grid shows — the parent link is dropped in flat-list mode, and a row the filter did
 * not match is opened, because the only reason it is on the chart is a descendant that did match.
 */
export const toGanttTask = (record: IRecord, services: IGanttServiceLocator): Task => {
    const taskGridServices = services.get('taskGridServices');
    const taskDataProvider = taskGridServices.get('taskDataProvider');
    const dates = services.get('ganttDates');
    const fieldMapping = services.get('fieldMapping');
    const recordId = record.getRecordId();
    const parent: ComponentFramework.EntityReference | null = record.getValue(taskGridServices.get('nativeColumns').parentId)?.[0];
    const hasChildren = taskDataProvider.getRecordTree().view.hasChildren(recordId);

    return {
        id: recordId,
        text: record.getNamedReference().name,
        start_date: dates.getStartDate(record) ?? undefined,
        end_date: dates.getEndDate(record) ?? undefined,
        bar_height: hasChildren ? SUMMARY_BAR_HEIGHT : TASK_BAR_HEIGHT,
        progress: getProgress(record, services),
        parent: taskDataProvider.isFlatListEnabled() ? undefined : parent?.id?.guid,
        active: record.isActive(),
        open: isOpenByDefault(recordId, services),
    };
};

/** The chart takes progress as a fraction; the column holds a percentage. */
const getProgress = (record: IRecord, services: IGanttServiceLocator): number => {
    const columnName = services.get('fieldMapping').percentComplete;
    if (!columnName) {
        return 0;
    }
    return (record.getValue(columnName) ?? 0) / 100;
};

const isOpenByDefault = (recordId: string, services: IGanttServiceLocator): boolean => {
    const taskDataProvider = services.get('taskGridServices').get('taskDataProvider');
    if (taskDataProvider.isFlatListEnabled()) {
        return false;
    }
    //a task the filter or quick find did not match is only on the chart because a descendant of it was
    //matched, so it opens to show that descendant
    if (!taskDataProvider.getRecordTree().view.isMatching(recordId)) {
        return true;
    }
    return services.get('ganttExpansion').isTaskExpanded(recordId);
};
