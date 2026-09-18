import { Task } from 'gantt-trial';
import { Formatting } from '@talxis/client-libraries';
import { useServices, useTaskDataProvider } from '@components/TaskGrid/context';
import { useGanttServices } from '../../../../context';
import { useGanttTaskTooltipComponents } from '../../context';

export interface ITaskTooltipAdapterProps {
    /** The task the pointer is on, or the one being dragged. */
    task: Task;
    /** The pointer event that opened it — what the callout is positioned against. */
    event: MouseEvent;
}

/**
 * Everything the tooltip needs, read off the task and formatted: the name, the dates, how long it runs, the
 * colour of its status.
 *
 * Plumbing rather than a component to swap — {@link IGanttTaskTooltipComponents.onRenderTooltip} is what a
 * consumer replaces, and it receives what this worked out.
 */
export const TaskTooltipAdapter = (props: ITaskTooltipAdapterProps) => {
    const { task, event } = props;
    const components = useGanttTaskTooltipComponents();
    const taskDataProvider = useTaskDataProvider();
    const services = useGanttServices();
    const taskGridServices = useServices();
    const formatting = Formatting.Get();
    const nativeColumns = taskGridServices.get('nativeColumns');
    const ganttColumns = services.get('fieldMapping');
    const record = taskDataProvider.getRecordsMap()[task.id];
    const startDate = record?.getFormattedValue(ganttColumns.startDate) ?? undefined;
    const endDate = record?.getValue(ganttColumns.endDate)
        ? record.getFormattedValue(ganttColumns.endDate) ?? undefined
        : undefined;
    const duration = endDate ? formatting.formatDuration((task.duration ?? 0) * 24 * 60) : undefined;
    let statusColor: string | undefined;
    if (ganttColumns.statusCode) {
        const statusCode = record?.getValue(ganttColumns.statusCode);
        const statusCodeColumn = taskDataProvider.getColumnsMap()[ganttColumns.statusCode];
        const options = statusCodeColumn?.metadata?.OptionSet ?? [];
        statusColor = options.find(option => option.Value == statusCode)?.Color;
    }

    return components.onRenderCallout({
        target: {
            x: event.clientX + 10,
            y: event.clientY + 12,
        },
        children: components.onRenderTooltip({
            taskName: record?.getValue(nativeColumns.subject),
            startDate: startDate,
            endDate: endDate,
            duration: duration,
            statusColor: statusColor,
        }),
    });
};
