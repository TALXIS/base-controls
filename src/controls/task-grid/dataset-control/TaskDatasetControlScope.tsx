import { ReactNode, useContext, useEffect } from "react";
import type { IRecord } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks";
import { DataProviderContext, useContextWithNullCheck } from "@utils";
import type { ITaskDataProvider, ITaskDataProviderEvents } from "../provider";
import { useRequiredDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root/context";
import { useDatasetControlPart } from "@controls/dataset-control/components/adapters/root/useDatasetControlPart";
import { TaskRuntime } from "../runtime/TaskRuntime";
import { TaskRuntimeContext, TaskDatasetControlPropsContext } from "./context";

/** One mount's task runtime: there before the mount loads, gone with it. */
export const TaskDatasetControlScope = (props: { children: ReactNode }) => {
    const datasetControl = useRequiredDatasetControlRuntime();
    const { labels, pcfContext, propsRef } = useContextWithNullCheck(TaskDatasetControlPropsContext);
    const runtime = useDatasetControlPart('taskRuntime', () => new TaskRuntime({ datasetControl, labels, pcfContext, onGetProps: () => propsRef.current }));

    //the provider of this mount's last load
    const provider = useContext(DataProviderContext) as ITaskDataProvider | null;

    useEventEmitter<ITaskDataProviderEvents>(provider?.taskEvents, 'onTasksCreated', (records: IRecord[], parentId?: string) => propsRef.current.onTasksCreated?.(records, parentId));
    useEventEmitter<ITaskDataProviderEvents>(provider?.taskEvents, 'onTasksDeleted', (taskIds: string[]) => propsRef.current.onTasksDeleted?.(taskIds));
    useEventEmitter<ITaskDataProviderEvents>(provider?.taskEvents, 'onTasksUpdated', (records: IRecord[]) => propsRef.current.onTasksUpdated?.(records));

    useEffect(() => () => runtime.destroy(), []);

    return <TaskRuntimeContext.Provider value={runtime}>{props.children}</TaskRuntimeContext.Provider>;
};
