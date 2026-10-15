import { useEventEmitter } from "@hooks";
import type { IRecord } from "@talxis/client-libraries";
import type { ITaskDataProvider, ITaskDataProviderEvents, ITaskMoveParams } from "./provider";
import type { ITaskGridProps } from "./interfaces";

export const useTaskGridEventHandlers = (provider: ITaskDataProvider, props: ITaskGridProps) => {
    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, 'onTasksCreated', (records: IRecord[], parentId?: string) => props.onTasksCreated?.(records, parentId));
    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, 'onTasksDeleted', (taskIds: string[]) => props.onTasksDeleted?.(taskIds));
    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, 'onTaskMoved', (params: ITaskMoveParams) => props.onTaskMoved?.(params));
    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, 'onTasksUpdated', (records: IRecord[]) => props.onTasksUpdated?.(records));
};
