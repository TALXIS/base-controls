import { useMemo, useRef } from "react";
import { useLatest } from "@hooks";
import { LocalizationService, usePcfContext } from "@utils";
import { Root as DatasetControl } from "@controls/dataset-control/components/adapters/root/Root";
import type { IDatasetControlProps } from "@controls/dataset-control/components/adapters/root/Root";
import type { IDatasetControlLabels } from "@controls/dataset-control/components/adapters/root/labels";
import type { IDatasetControl, IDatasetControlModules } from "@controls/dataset-control/runtime/interfaces";
import type { IDatasetControlLoadParameters } from "@controls/dataset-control/runtime/DatasetControlRuntime";
import { ITaskGridLabels, TASK_GRID_LABELS } from "../labels";
import type { ITaskGridEventHandlers, ITaskGridLoadParameters, ITaskGridLoadResult } from "../interfaces";
import type { ITaskViewData } from "../provider";
import type { ITaskDatasetControlRuntime } from "../runtime";
import { ITaskDatasetControlPropsContext, TaskDatasetControlPropsContext } from "./context";
import { TaskDatasetControlScope } from "./TaskDatasetControlScope";

/** The modules a TaskDatasetControl is given; each module adds its own key. */
export interface ITaskDatasetControlModules extends IDatasetControlModules<ITaskViewData> { }

export interface ITaskDatasetControlProps extends Omit<IDatasetControlProps<ITaskViewData>, 'onLoad' | 'onMounted' | 'onReady' | 'onDestroyed' | 'scope' | 'labels' | 'modules'>, Partial<ITaskGridEventHandlers> {
    /** The control's modules; read on every mount. */
    modules?: ITaskDatasetControlModules;
    /** Returns the view's provider and field mapping; called on every mount. */
    onLoad: (parameters: ITaskGridLoadParameters) => Promise<ITaskGridLoadResult>;
    /** The control's and the task grid's strings; read once, at mount. */
    labels?: Partial<IDatasetControlLabels & ITaskGridLabels>;
    /** Called on every mount with its task runtime, before its load; subscribe to its events here. */
    onMounted?: (taskDatasetControl: ITaskDatasetControlRuntime) => void;
    /** Called on every mount once its load succeeded. */
    onReady?: (taskDatasetControl: ITaskDatasetControlRuntime) => void;
    /** Called as each mount goes, while its provider still holds its data. */
    onDestroyed?: (taskDatasetControl: ITaskDatasetControlRuntime) => void;
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
        propsRef.current.onMounted?.(datasetControl.parts.get('taskDatasetControl'));
    };

    const onReady = (datasetControl: IDatasetControl<ITaskViewData>) => propsRef.current.onReady?.(datasetControl.parts.get('taskDatasetControl'));

    const onDestroyed = (datasetControl: IDatasetControl<ITaskViewData>) => {
        const taskDatasetControl = datasetControl.parts.find('taskDatasetControl');
        if (taskDatasetControl) {
            propsRef.current.onDestroyed?.(taskDatasetControl);
        }
    };

    const onLoad = (parameters: IDatasetControlLoadParameters<ITaskViewData>) => datasetControlRef.current!.parts.get('taskDatasetControl').load(parameters);

    const { onLoad: _onLoad, onMounted: _onMounted, onReady: _onReady, onDestroyed: _onDestroyed, onTasksCreated: _onTasksCreated, onTasksDeleted: _onTasksDeleted, onTaskMoved: _onTaskMoved, onTasksUpdated: _onTasksUpdated, ...datasetControlProps } = props;

    return <TaskDatasetControlPropsContext.Provider value={propsContext}>
        <DatasetControl {...datasetControlProps} scope={TaskDatasetControlScope} onMounted={onMounted} onReady={onReady} onDestroyed={onDestroyed} onLoad={onLoad} />
    </TaskDatasetControlPropsContext.Provider>;
};
