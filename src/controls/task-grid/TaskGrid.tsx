import { useEffect, useMemo } from "react";
import { createClientSideRowModelModule, Grid, GRID_LABELS, IGridModules } from "@controls/grid";
import { useDatasetControlRuntime } from "@controls/dataset-control/components/adapters/root/context";
import { useLatest } from "@hooks";
import { LocalizationService, useDataProvider, usePcfContext } from "@utils";
import { ITaskDataProvider } from "./provider";
import { TaskGridRuntime } from "./runtime";
import { createTaskTreeModule } from "./tree/createTaskTreeModule";
import { ITaskGridLabels, TASK_GRID_LABELS } from "./labels";
import { ITaskGridProps } from "./interfaces";
import { ITaskGridContext, TaskGridContext } from "./context";
import { useTaskGridEventHandlers } from "./useTaskGridEventHandlers";

const isTaskDataProvider = (provider: unknown): provider is ITaskDataProvider => typeof (provider as ITaskDataProvider).getRecordTree === 'function';

/** A grid of tasks shown as a tree; reads its `TaskDataProvider` from the DatasetControl around it. */
export const TaskGridRoot = (props: ITaskGridProps) => {
    const provider = useDataProvider();
    if (!isTaskDataProvider(provider)) {
        throw new Error('TaskGrid needs a TaskDataProvider: return one from the DatasetControl\'s onLoad.');
    }
    const pcfContext = usePcfContext();
    const datasetControl = useDatasetControlRuntime();
    const propsRef = useLatest(props);
    const labels = useMemo(() => new LocalizationService<ITaskGridLabels>({ ...GRID_LABELS, ...TASK_GRID_LABELS, ...props.labels }), []);

    const runtime = useMemo(() => new TaskGridRuntime({
        provider,
        pcfContext,
        labels,
        onIsTaskCreationEnabled: () => !!propsRef.current.enableTaskCreation,
    }), []);

    const modules = useMemo((): IGridModules => {
        const { custom = [], ...gridModules } = props.modules ?? {};
        return {
            ...gridModules,
            rowModel: createClientSideRowModelModule(),
            custom: [createTaskTreeModule({ runtime, onIsRowDraggingEnabled: () => !!propsRef.current.enableRowDragging }), ...custom],
        };
    }, []);

    const context = useMemo((): ITaskGridContext => ({ runtime, components: props.components ?? {} }), [props.components]);

    useTaskGridEventHandlers(provider, props);

    //the header's parts reach the task grid through the control, and the task grid its ribbon
    useEffect(() => {
        const services = datasetControl?.services;
        let isMounted = true;
        let detachRibbon: (() => void) | undefined;
        services?.register('taskGrid', () => runtime);
        services?.whenAvailable('ribbon', ribbon => {
            if (isMounted) {
                detachRibbon = runtime.attachRibbon(ribbon);
            }
        });
        return () => {
            isMounted = false;
            detachRibbon?.();
            if (services?.find('taskGrid') === runtime) {
                services.unregister('taskGrid');
            }
        };
    }, []);

    const { modules: _modules, labels: _labels, enableRowDragging: _enableRowDragging, enableTaskCreation: _enableTaskCreation, onReady: _onReady, onDestroyed: _onDestroyed, onTasksCreated: _onTasksCreated, onTasksDeleted: _onTasksDeleted, onTaskMoved: _onTaskMoved, onTasksUpdated: _onTasksUpdated, ...gridProps } = props;

    return <TaskGridContext.Provider value={context}>
        <Grid
            {...gridProps}
            modules={modules}
            labels={props.labels}
            onReady={() => propsRef.current.onReady?.(runtime)}
            onDestroyed={() => propsRef.current.onDestroyed?.(runtime)} />
    </TaskGridContext.Provider>;
};
