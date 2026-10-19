import { MutableRefObject } from "react";
import { useEventEmitter } from "@hooks";
import type { IRecord } from "@talxis/client-libraries";
import type { ITaskDataProvider, ITaskDataProviderEvents, ITaskMoveParams } from "../provider";
import type { ITaskGridEventHandlers } from "../interfaces";

export const useTaskDatasetControlEventHandlers = (provider: ITaskDataProvider | undefined, handlersRef: MutableRefObject<Partial<ITaskGridEventHandlers>>) => {
    const taskEvents = provider?.taskEvents;
    useEventEmitter<ITaskDataProviderEvents>(taskEvents, 'onTasksCreated', (records: IRecord[], parentId?: string) => handlersRef.current.onTasksCreated?.(records, parentId));
    useEventEmitter<ITaskDataProviderEvents>(taskEvents, 'onTasksDeleted', (taskIds: string[]) => handlersRef.current.onTasksDeleted?.(taskIds));
    useEventEmitter<ITaskDataProviderEvents>(taskEvents, 'onTaskMoved', (params: ITaskMoveParams) => handlersRef.current.onTaskMoved?.(params));
    useEventEmitter<ITaskDataProviderEvents>(taskEvents, 'onTasksUpdated', (records: IRecord[]) => handlersRef.current.onTasksUpdated?.(records));
};
