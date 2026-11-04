import { ReactNode, useContext, useEffect } from "react";
import type { IRecord } from "@talxis/client-libraries";
import { useEventEmitter, useContextWithNullCheck } from "@core";
import { DataProviderContext } from "@data";
import type { ITaskDataProvider, ITaskDataProviderEvents } from "../../runtime/provider";
import { useRequiredDatasetControlRuntime } from "../../../dataset-control/adapters/root/context";
import { useDatasetControlPart } from "../../../dataset-control";
import { TaskRuntime } from "../../runtime/TaskRuntime";
import { TaskRuntimeContext, TaskDatasetControlPropsContext } from "./context";

export interface ITaskDatasetControlScopeProps {
    children: ReactNode;
}

/** One mount's task runtime, there before the mount loads. */
export const TaskDatasetControlScope = (props: ITaskDatasetControlScopeProps) => {
    const datasetControl = useRequiredDatasetControlRuntime();
    const { pcfContext, propsRef } = useContextWithNullCheck(TaskDatasetControlPropsContext);
    const runtime = useDatasetControlPart('taskRuntime', () => new TaskRuntime({ datasetControl, pcfContext, onGetProps: () => propsRef.current }));

    //the provider of this mount's last load
    const provider = useContext(DataProviderContext) as ITaskDataProvider | null;

    useEventEmitter<ITaskDataProviderEvents>(provider?.taskEvents, 'onTasksCreated', (records: IRecord[], parentId?: string) => propsRef.current.onTasksCreated?.(records, parentId));
    useEventEmitter<ITaskDataProviderEvents>(provider?.taskEvents, 'onTasksDeleted', (taskIds: string[]) => propsRef.current.onTasksDeleted?.(taskIds));
    useEventEmitter<ITaskDataProviderEvents>(provider?.taskEvents, 'onTasksUpdated', (records: IRecord[]) => propsRef.current.onTasksUpdated?.(records));

    useEffect(() => () => runtime.destroy(), []);

    return <TaskRuntimeContext.Provider value={runtime}>{props.children}</TaskRuntimeContext.Provider>;
};
