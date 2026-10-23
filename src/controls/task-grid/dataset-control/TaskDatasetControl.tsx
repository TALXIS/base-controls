import { useMemo, useRef } from "react";
import type { IRecord } from "@talxis/client-libraries";
import { useLatest } from "@hooks";
import { LocalizationService, usePcfContext } from "@utils";
import { Root as DatasetControl } from "@controls/dataset-control/components/adapters/root/Root";
import type { IDatasetControlProps } from "@controls/dataset-control/components/adapters/root/Root";
import type { IDatasetControlLabels } from "@controls/dataset-control/components/adapters/root/labels";
import type { IDatasetControl, IDatasetControlModule } from "@controls/dataset-control/runtime/interfaces";
import type { IDatasetControlLoadParameters } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import { ITaskGridLabels, TASK_GRID_LABELS } from "../labels";
import type { ITaskGridLoadParameters, ITaskGridLoadResult } from "../interfaces";
import type { ITaskViewData } from "../provider";
import type { ITaskRuntime } from "../runtime";
import { ITaskDatasetControlPropsContext, TaskDatasetControlPropsContext } from "./context";
import { TaskDatasetControlScope } from "./TaskDatasetControlScope";


export interface ITaskDatasetControlProps extends Omit<IDatasetControlProps<ITaskViewData>, 'onLoad' | 'onMounted' | 'onReady' | 'onDestroyed' | 'scope' | 'labels' | 'modules'> {
    /** The New command and the add-subtask buttons. */
    enableCreation?: boolean;
    /** The Edit command, and editing tasks in the grid and in their forms. */
    enableEditing?: boolean;
    /** The Delete command. */
    enableDeletion?: boolean;
    /** The control's modules; read on every mount. */
    modules?: IDatasetControlModule[];
    /** Returns the view's provider and field mapping; called on every mount. */
    onLoad: (parameters: ITaskGridLoadParameters) => Promise<ITaskGridLoadResult>;
    /** Called after tasks are created, with the parent they went under. */
    onTasksCreated?: (records: IRecord[], parentId?: string) => void;
    /** Called after tasks are deleted. */
    onTasksDeleted?: (taskIds: string[]) => void;
    /** Called after tasks change, from a form save or a move. */
    onTasksUpdated?: (records: IRecord[]) => void;
    /** The control's and the task grid's strings; read once, at mount. */
    labels?: Partial<IDatasetControlLabels & ITaskGridLabels>;
    /** Called on every mount with its task runtime, before its load; subscribe to its events here. */
    onMounted?: (taskRuntime: ITaskRuntime) => void;
    /** Called on every mount once its load succeeded. */
    onReady?: (taskRuntime: ITaskRuntime) => void;
    /** Called as each mount goes, while its provider still holds its data. */
    onDestroyed?: (taskRuntime: ITaskRuntime) => void;
}

/** A DatasetControl of tasks: `onLoad` returns the provider for the view; `TaskGrid` goes in its body. */
export const TaskDatasetControlRoot = (props: ITaskDatasetControlProps) => {
    const propsRef = useLatest(props);
    const pcfContext = usePcfContext();
    const propsContext = useMemo((): ITaskDatasetControlPropsContext => ({
        labels: new LocalizationService<ITaskGridLabels>({ ...TASK_GRID_LABELS, ...props.labels }),
        pcfContext,
        propsRef,
    }), []);
    const datasetControlRef = useRef<IDatasetControl<ITaskViewData>>();

    const onMounted = (datasetControl: IDatasetControl<ITaskViewData>) => {
        datasetControlRef.current = datasetControl;
        propsRef.current.onMounted?.(datasetControl.parts.get('taskRuntime'));
    };

    const onReady = (datasetControl: IDatasetControl<ITaskViewData>) => propsRef.current.onReady?.(datasetControl.parts.get('taskRuntime'));

    const onDestroyed = (datasetControl: IDatasetControl<ITaskViewData>) => {
        const taskRuntime = datasetControl.parts.find('taskRuntime');
        if (taskRuntime) {
            propsRef.current.onDestroyed?.(taskRuntime);
        }
    };

    const onLoad = (parameters: IDatasetControlLoadParameters<ITaskViewData>) => datasetControlRef.current!.parts.get('taskRuntime').load(parameters);

    const { onLoad: _onLoad, onMounted: _onMounted, onReady: _onReady, onDestroyed: _onDestroyed, enableCreation, enableEditing, enableDeletion, onTasksCreated, onTasksDeleted, onTasksUpdated, ...datasetControlProps } = props;

    return <TaskDatasetControlPropsContext.Provider value={propsContext}>
        <DatasetControl {...datasetControlProps} scope={TaskDatasetControlScope} onMounted={onMounted} onReady={onReady} onDestroyed={onDestroyed} onLoad={onLoad} />
    </TaskDatasetControlPropsContext.Provider>;
};
