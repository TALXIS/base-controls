import type { IRecord } from "@talxis/client-libraries";
import { useLatest } from "@core";
import { usePcfContext } from "@pcf";
import { DatasetControl, useDatasetControl } from "@controls/dataset-control";
import type { IDatasetControl, IDatasetControlModule, IDatasetControlProps } from "@controls/dataset-control";
import type { ITaskGridLoadResult } from "../../interfaces";
import type { ITaskViewData, TaskCreatePosition } from "../../runtime/provider";
import { TaskRuntime } from "../../runtime/TaskRuntime";
import { TaskRuntimeContext } from "./context";

export interface ITaskDatasetControlProps extends Omit<IDatasetControlProps<ITaskViewData>, 'onLoad' | 'modules'> {
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
    /** Returns the provider, field mapping and views on every mount; `control.modules.get('taskRuntime')` is the task runtime. */
    onLoad: (control: IDatasetControl<ITaskViewData>) => ITaskGridLoadResult | Promise<ITaskGridLoadResult>;
    /** Called after tasks are created, with the parent they went under. */
    onTasksCreated?: (records: IRecord[], parentId?: string) => void;
    /** Called after tasks are deleted. */
    onTasksDeleted?: (taskIds: string[]) => void;
    /** Called after tasks take new values from the store. */
    onTasksUpdated?: (records: IRecord[]) => void;
}

/** A DatasetControl of tasks with a `TaskGrid` in its body. */
export const TaskDatasetControlRoot = (props: ITaskDatasetControlProps) => {
    const propsRef = useLatest(props);
    const pcfContext = usePcfContext();

    //first, so the task modules after it find it as they load
    const taskRuntimeModule: IDatasetControlModule<'taskRuntime'> = {
        name: 'taskRuntime',
        onLoad: datasetControl => new TaskRuntime({ datasetControl, pcfContext, onGetProps: () => propsRef.current }),
        onDestroy: taskRuntime => (taskRuntime as TaskRuntime).destroy(),
    };
    //the task runtime sets up the provider your onLoad returns
    const onLoad = (datasetControl: IDatasetControl<ITaskViewData>) => datasetControl.modules.get('taskRuntime').load();

    const { onLoad: _onLoad, modules = [], enableCreation, defaultCreatePosition, enableEditing, enableDeletion, hoursPerDay, onTasksCreated, onTasksDeleted, onTasksUpdated, children, ...datasetControlProps } = props;

    return <DatasetControl {...datasetControlProps} modules={[taskRuntimeModule, ...modules]} onLoad={onLoad}>
        <TaskRuntimeProvider>{children}</TaskRuntimeProvider>
    </DatasetControl>;
};

//the parts render on a ready control, so its task runtime is there
const TaskRuntimeProvider = (props: { children: React.ReactNode }) => {
    const taskRuntime = useDatasetControl().modules.get('taskRuntime');
    return <TaskRuntimeContext.Provider value={taskRuntime}>{props.children}</TaskRuntimeContext.Provider>;
};
