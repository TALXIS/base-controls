import { Formatting } from '@talxis/client-libraries';
import { TaskTooltip } from '../task-tooltip';
import { useServices, useTaskDataProvider } from '@components/TaskGrid/context';
import { IGanttTaskTooltipProps, useGanttServices } from '../../../context';
import { TaskTooltipAdapterComponents, ITaskTooltipAdapterComponents } from './components';

export interface ITaskTooltipAdapterProps extends IGanttTaskTooltipProps {
    components?: Partial<ITaskTooltipAdapterComponents>;
}

export const TaskTooltipAdapter = (props: ITaskTooltipAdapterProps) => {
    const { task, event } = props;
    const components = { ...TaskTooltipAdapterComponents, ...props.components };
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
        children: (
            <TaskTooltip
                taskName={record?.getValue(nativeColumns.subject)}
                startDate={startDate}
                endDate={endDate}
                duration={duration}
                statusColor={statusColor}
            />
        )
    });
};
