import * as React from "react";
import { IRawRecord } from "@talxis/client-libraries";
import { LocalizationService, usePcfContext } from "@utils";
import type { IGrid, IGridLabels } from "@controls/grid";
import { DatasetControl, IDatasetControlRuntime } from "@controls/dataset-control";
import { GridOptionsContext, ITaskGridGridOptions, TaskGridComponentsContext, TaskGridRuntimeContext, useTaskGridRuntime } from "./context";
import { getTaskGridStyles } from "./styles";
import { Grid } from "./components/grid";
import { CommandBar } from "./components/header/command-bar";
import { ViewSwitcher } from "./components/header/view-switcher";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";
import { IDeleteTasksResult, IOpenDatasetItemsResult } from "./providers/task";
import { IDeletedUserQueriesResult } from "./providers/saved-query";
import { ITaskGridLabels, TASK_GRID_LABELS } from "./labels";
import { ITaskGridDescriptor } from "./interfaces";
import { ITaskGridRuntime, TaskGridRuntime } from "./runtime";
import { useTaskGridEvents } from "./useTaskGridEvents";
import { ITaskGridFeature, ITaskGridFeatures, ITaskGridModules } from "./modules/interfaces";
import { useLatest } from "@hooks";

/** Props for {@link TaskGrid}: the shared grid's own, less what the task grid owns, and the task grid's. */
export interface ITaskGridProps extends Omit<IGrid, 'modules' | 'stateKey' | 'height' | 'labels' | 'components' | 'onError' | 'onOpenRecord' | 'onDestroyed'> {
    /** Supplies the tasks, the views and the task strategy. See {@link ITaskGridDescriptor}. */
    descriptor: ITaskGridDescriptor;
    /** Grid modules, merged over multi-row selection and, with task editing on, auto-saving editing; read once, at mount. */
    modules?: ITaskGridModules;
    /** The task grid's own features; read once, at mount. */
    features?: ITaskGridFeatures;
    /** The key the task grid keeps its state under, per view, in the state store. */
    stateKey?: string;
    /** `'100%'` fills the parent; the content's height when left out. */
    height?: string;
    /** Overrides for any subset of the grid's and the task grid's strings. */
    labels?: Partial<IGridLabels & ITaskGridLabels>;
    /** Overrides for any subset of the replaceable components. See {@link ITaskGridComponents}. */
    components?: Partial<ITaskGridComponents>;
    /** Called once, after the first view loaded. */
    onReady?: (runtime: ITaskGridRuntime) => void;
    /** Called before the task grid goes, while every provider still holds its data. */
    onDestroyed?: (runtime: ITaskGridRuntime) => void;
    /** Called for every error the task grid reports, beside its own error dialog. */
    onError?: (error: any, message: string) => void;
    /** Called before tasks are created. */
    onBeforeTasksCreated?: (parentTaskId?: string) => void;
    /** Called after tasks were created, with the raw records the strategy returned. */
    onTasksCreated?: (records: IRawRecord[] | null, parentTaskId?: string) => void;
    /** Called before tasks are deleted, with the ids the grid asked for — descendants are resolved by the strategy. */
    onBeforeTasksDeleted?: (taskIds: string[]) => void;
    /** Called after a delete completed, with the per-task result. */
    onTasksDeleted?: (result: IDeleteTasksResult | null) => void;
    /** Called before a task is reordered or reparented. */
    onBeforeTaskMoved?: () => void;
    /**
     * Called after a move finished. `result` is `null` when the task did not move — the grid refused the
     * drop, or the strategy cancelled — so check it before treating the move as done.
     */
    onTaskMoved?: (movingTaskId: string, targetTaskId: string, position: 'above' | 'below' | 'child', result: IRawRecord[] | null) => void;
    /** Called whenever the strategy hands back new raw data — after a move, a save that changed other rows, a manual `updateTaskData`. */
    onTaskDataUpdated?: (data: IRawRecord[]) => void;
    /** Called after the hierarchy was rebuilt, with the parents whose children changed. */
    onRecordTreeUpdated?: (updatedParentIds: (string | undefined)[]) => void;
    /** Called before the user's records are opened — a task, or a related record from a lookup. */
    onBeforeDatasetItemsOpened?: (entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean) => void;
    /** Called after an open completed, with whatever the strategy returned. */
    onDatasetItemsOpened?: (entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean, result: IOpenDatasetItemsResult | null) => void;
    /** Called before a personal view is created, with the name the user typed. */
    onBeforeUserQueryCreated?: (queryName: string) => void;
    /** Called after a personal view was created, with its id — or `null` when the user cancelled. */
    onUserQueryCreated?: (queryId: string | null) => void;
    /** Called before a personal view is updated. */
    onBeforeUserQueryUpdated?: (queryId: string) => void;
    /** Called after a personal view was updated, with its id — or `null` when the user cancelled. */
    onUserQueryUpdated?: (queryId: string | null) => void;
    /** Called before personal views are deleted. */
    onBeforeUserQueriesDeleted?: (queryIds: string[]) => void;
    /** Called after a delete of personal views completed, with the per-view result. */
    onUserQueriesDeleted?: (result: IDeletedUserQueriesResult) => void;
    /** Called before a template is captured from a task. Only fires when templates are enabled. */
    onBeforeTemplateCreated?: (taskId: string) => void;
    /** Called after a template was captured, with the raw record — or `null` when the user cancelled. */
    onTemplateCreated?: (record: IRawRecord | null) => void;
}

/** A hierarchical task grid over the descriptor's tasks and views; render it inside a `PcfContextProvider`. */
export const TaskGrid = (props: ITaskGridProps) => {
    const propsRef = useLatest(props);
    const pcfContext = usePcfContext();
    const pcfContextRef = useLatest(pcfContext);
    const options = React.useMemo(() => getGridOptions(props), []);
    const runtime = React.useMemo(() => new TaskGridRuntime({
        descriptor: props.descriptor,
        features: options.features,
        labels: new LocalizationService({ ...TASK_GRID_LABELS, ...props.labels }),
        onGetPcfContext: () => pcfContextRef.current,
    }), []);
    const components = { ...TaskGridComponents, ...props.components };
    const { onRenderCommandBar, overlays, rows, ...datasetControlComponents } = components;
    const styles = React.useMemo(() => getTaskGridStyles(), []);

    const onReady = (datasetControl: IDatasetControlRuntime) => {
        runtime.attach(datasetControl);
        const onFirstLoaded = () => {
            datasetControl.events.removeEventListener('onLoaded', onFirstLoaded);
            propsRef.current.onReady?.(runtime);
        };
        datasetControl.events.addEventListener('onLoaded', onFirstLoaded);
    };

    const onDestroyed = () => {
        propsRef.current.onDestroyed?.(runtime);
        runtime.destroy();
    };

    return <TaskGridRuntimeContext.Provider value={runtime}>
        <GridOptionsContext.Provider value={options}>
            <TaskGridComponentsContext.Provider value={components}>
                <DatasetControl
                    stateKey={props.stateKey}
                    height={props.height}
                    className={styles.taskGrid}
                    components={datasetControlComponents}
                    onLoad={parameters => runtime.load(parameters)}
                    onReady={onReady}
                    onDestroyed={onDestroyed}>
                    <TaskGridEvents {...props} />
                    <TaskGridHeader />
                    <DatasetControl.Notifications />
                    <DatasetControl.Body>
                        <TaskGridBody />
                    </DatasetControl.Body>
                </DatasetControl>
            </TaskGridComponentsContext.Provider>
        </GridOptionsContext.Provider>
    </TaskGridRuntimeContext.Provider>;
};

const TaskGridEvents = (props: ITaskGridProps) => {
    useTaskGridEvents(props);
    return null;
};

const TaskGridHeader = () => {
    const runtime = useTaskGridRuntime();
    const gantt = runtime.services.find('ganttModule');
    const customColumns = runtime.services.find('customColumnsModule');
    return <DatasetControl.Header>
        <DatasetControl.Header.Start>
            {runtime.isViewSwitcherEnabled() && <ViewSwitcher />}
            {gantt?.services.get('components').onRenderZoomSlider()}
        </DatasetControl.Header.Start>
        <DatasetControl.Header.End>
            <CommandBar />
            {runtime.isEditColumnsEnabled() && <DatasetControl.EditColumns
                enableScopeSelector={runtime.isEditColumnsScopeSelectorEnabled()}
                components={customColumns?.components.editColumns} />}
            {runtime.isQuickFindEnabled() && <DatasetControl.QuickFind />}
        </DatasetControl.Header.End>
    </DatasetControl.Header>;
};

const TaskGridBody = () => {
    const gantt = useTaskGridRuntime().services.find('ganttModule');
    return gantt ? gantt.services.get('components').onRenderView() : <Grid />;
};

const getGridOptions = (props: ITaskGridProps): ITaskGridGridOptions => {
    const {
        descriptor, modules = {}, features = {}, stateKey, height, components, onReady, onDestroyed, onError, onBeforeTasksCreated, onTasksCreated,
        onBeforeTasksDeleted, onTasksDeleted, onBeforeTaskMoved, onTaskMoved, onTaskDataUpdated, onRecordTreeUpdated, onBeforeDatasetItemsOpened,
        onDatasetItemsOpened, onBeforeUserQueryCreated, onUserQueryCreated, onBeforeUserQueryUpdated, onUserQueryUpdated, onBeforeUserQueriesDeleted,
        onUserQueriesDeleted, onBeforeTemplateCreated, onTemplateCreated, ...gridProps
    } = props;
    const { userQueries, templates, customColumns, lookupMany, dependencies, checklist, gantt, project, custom = [] } = features;
    return {
        gridProps: { ...gridProps, components: { overlays: components?.overlays, rows: components?.rows } },
        modules,
        features: [customColumns, userQueries, templates, project, lookupMany, dependencies, checklist, gantt, ...custom].filter((feature): feature is ITaskGridFeature => !!feature),
    };
};
