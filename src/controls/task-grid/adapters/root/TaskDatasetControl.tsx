import type { IRecord } from "@talxis/client-libraries";
import { useLatest } from "@core";
import { usePcfContext } from "@pcf";
import { DatasetControl, useDatasetControl } from "@controls/dataset-control";
import type { IDatasetControl, IDatasetControlModule, IDatasetControlProps } from "@controls/dataset-control";
import type { IDatasetControlRuntime } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import type { ITaskGridLoadResult } from "../../interfaces";
import type { ITaskViewData, TaskCreatePosition } from "../../runtime/provider";
import type { ITaskRuntime } from "../../runtime";
import { TaskRuntime } from "../../runtime/TaskRuntime";
import { TaskRuntimeContext } from "./context";

export interface ITaskDatasetControlProps extends Omit<IDatasetControlProps<ITaskViewData>, 'onLoad' | 'onSetup' | 'modules'> {
    /** The New command and the add-subtask buttons. */
    enableCreation?: boolean;
    /** Where among its parent's children a new task goes, `first` by default. */
    defaultCreatePosition?: TaskCreatePosition;
    /** The Edit command, and editing tasks in the grid and in their forms. */
    enableEditing?: boolean;
    /** The Delete command. */
    enableDeletion?: boolean;
    /** How many hours a day of a task's duration holds, 24 by default. */
    hoursPerDay?: number;
    /** The control's modules, read on every mount. */
    modules?: IDatasetControlModule[];
    /** Returns the view's provider and field mapping on every mount. */
    onLoad: (taskRuntime: ITaskRuntime) => ITaskGridLoadResult | Promise<ITaskGridLoadResult>;
    /** Called after tasks are created, with the parent they went under. */
    onTasksCreated?: (records: IRecord[], parentId?: string) => void;
    /** Called after tasks are deleted. */
    onTasksDeleted?: (taskIds: string[]) => void;
    /** Called after tasks take new values from the store. */
    onTasksUpdated?: (records: IRecord[]) => void;
    /** Called on every mount with its task runtime, before its load. */
    onSetup?: (taskRuntime: ITaskRuntime) => void;
}

/** A DatasetControl of tasks with a `TaskGrid` in its body. */
export const TaskDatasetControlRoot = (props: ITaskDatasetControlProps) => {
    const propsRef = useLatest(props);
    const pcfContext = usePcfContext();

    //one task runtime per mount, there before the modules and onLoad read it
    const onSetup = (datasetControl: IDatasetControl<ITaskViewData>) => {
        const runtime = datasetControl as unknown as IDatasetControlRuntime;
        const taskRuntime = new TaskRuntime({ datasetControl: runtime, pcfContext, onGetProps: () => propsRef.current });
        runtime.services.register('taskRuntime', () => taskRuntime);
        runtime.lifecycle.events.addEventListener('onDestroyed', () => taskRuntime.destroy());
        propsRef.current.onSetup?.(taskRuntime);
    };
    const onLoad = (datasetControl: IDatasetControl<ITaskViewData>) => datasetControl.parts.get('taskRuntime').load();

    const { onLoad: _onLoad, onSetup: _onSetup, enableCreation, defaultCreatePosition, enableEditing, enableDeletion, hoursPerDay, onTasksCreated, onTasksDeleted, onTasksUpdated, children, ...datasetControlProps } = props;

    return <DatasetControl {...datasetControlProps} onSetup={onSetup} onLoad={onLoad}>
        <TaskRuntimeProvider>{children}</TaskRuntimeProvider>
    </DatasetControl>;
};

//the parts render on a ready control, so its task runtime is there
const TaskRuntimeProvider = (props: { children: React.ReactNode }) => {
    const taskRuntime = useDatasetControl().parts.get('taskRuntime');
    return <TaskRuntimeContext.Provider value={taskRuntime}>{props.children}</TaskRuntimeContext.Provider>;
};
