import { useMemo, useRef } from "react";
import { useLatest } from "@hooks";
import { LocalizationService, usePcfContext } from "@utils";
import { Root as DatasetControl } from "@controls/dataset-control/components/adapters/root/Root";
import type { IDatasetControlProps } from "@controls/dataset-control/components/adapters/root/Root";
import type { IDatasetControlLabels } from "@controls/dataset-control/components/adapters/root/labels";
import type { IDatasetControl } from "@controls/dataset-control/runtime/interfaces";
import type { IDatasetControlLoadParameters } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import { ITaskGridLabels, TASK_GRID_LABELS } from "../labels";
import type { ITaskGridEventHandlers, ITaskGridLoadParameters, ITaskGridLoadResult } from "../interfaces";
import type { ITaskViewData } from "../provider";
import type { ITaskDatasetControlRuntime } from "../runtime";
import { ITaskDatasetControlPropsContext, TaskDatasetControlPropsContext } from "./context";
import { TaskDatasetControlScope } from "./TaskDatasetControlScope";

export interface ITaskDatasetControlProps extends Omit<IDatasetControlProps<ITaskViewData>, 'onLoad' | 'onReady' | 'onDestroyed' | 'scope' | 'labels'>, Partial<ITaskGridEventHandlers> {
    /** Loads the data source for the view and the task modules; called on every mount, so on every view switch. */
    onLoad: (parameters: ITaskGridLoadParameters) => Promise<ITaskGridLoadResult>;
    /** The control's and the task grid's strings; read once, at mount. */
    labels?: Partial<IDatasetControlLabels & ITaskGridLabels>;
    /** Whether the New command and the add-task buttons are there. */
    enableTaskCreation?: boolean;
    /** Called on every mount with its task runtime, before its load. */
    onReady?: (taskDatasetControl: ITaskDatasetControlRuntime) => void;
    /** Called as each mount goes, while its provider still holds its data. */
    onDestroyed?: (taskDatasetControl: ITaskDatasetControlRuntime) => void;
}

/** A DatasetControl of tasks: `onLoad` hands it the data source and the modules; `TaskGrid` goes in its body. */
export const TaskDatasetControlRoot = (props: ITaskDatasetControlProps) => {
    const propsRef = useLatest(props);
    const pcfContext = usePcfContext();
    const propsContext = useMemo((): ITaskDatasetControlPropsContext => ({
        labels: new LocalizationService<ITaskGridLabels>({ ...TASK_GRID_LABELS, ...props.labels }),
        pcfContext,
        propsRef,
    }), []);
    const datasetControlRef = useRef<IDatasetControl<ITaskViewData>>();

    const onReady = (datasetControl: IDatasetControl<ITaskViewData>) => {
        datasetControlRef.current = datasetControl;
        propsRef.current.onReady?.(datasetControl.parts.get('taskDatasetControl'));
    };

    const onDestroyed = (datasetControl: IDatasetControl<ITaskViewData>) => {
        const taskDatasetControl = datasetControl.parts.find('taskDatasetControl');
        if (taskDatasetControl) {
            propsRef.current.onDestroyed?.(taskDatasetControl);
        }
    };

    const onLoad = (parameters: IDatasetControlLoadParameters<ITaskViewData>) => datasetControlRef.current!.parts.get('taskDatasetControl').load(parameters);

    const { onLoad: _onLoad, onReady: _onReady, onDestroyed: _onDestroyed, enableTaskCreation: _enableTaskCreation, onTasksCreated: _onTasksCreated, onTasksDeleted: _onTasksDeleted, onTaskMoved: _onTaskMoved, onTasksUpdated: _onTasksUpdated, ...datasetControlProps } = props;

    return <TaskDatasetControlPropsContext.Provider value={propsContext}>
        <DatasetControl {...datasetControlProps} scope={TaskDatasetControlScope} onReady={onReady} onDestroyed={onDestroyed} onLoad={onLoad} />
    </TaskDatasetControlPropsContext.Provider>;
};
