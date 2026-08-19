import { useEventEmitter } from "@hooks/useEventEmitter"
import { IDatasetControlEvents } from "@utils/dataset-control";
import { useRef } from "react";
import * as React from "react";
import { AgGridLicenseKeyContext, DatasetControlContext, LocalizationServiceContext, PcfContext, RootElementIdContext, TaskDataProviderContext, TaskGridComponentsContext, TaskGridDescriptorContext, usePcfContext } from "./context";
import { DatasetControl as DatasetControlRenderer } from "../DatasetControl";
import { useTheme } from "@fluentui/react";
import { getDatasetControlStyles } from "./styles";
import { Grid } from "./components/grid";
import { IDeleteTasksResult, IOpenDatasetItemsResult, ITaskDataProvider, ITaskDataProviderEventListener } from "./providers/task";
import { IDeletedUserQueriesResult, ISavedQueryDataProviderEvents } from "./providers/saved-query";
import { ITemplateDataProviderEvents } from "./providers/template";
import { ITaskGridLabels } from "./labels";
import { TASK_GRID_LABELS } from "./labels";
import { ITaskGridState, TaskGridDatasetControlFactory } from "./TaskGridDatasetControlFactory";
import { Header } from "./components/header/Header";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";
import { ITaskGridDescriptor, ITaskGridDatasetControl } from "./interfaces";
import { LocalizationService } from "@utils";
import { useTaskGridEvents } from "./useTaskGridEvents";
import { IDataProviderEventListeners, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";

export interface ITaskGridProps {
    //should be replaced by Context API in future
    pcfContext: ComponentFramework.Context<any, any>;
    taskGridDescriptor: ITaskGridDescriptor;
    labels?: Partial<ITaskGridLabels>;
    components?: Partial<ITaskGridComponents>;
    /**
     * Called with the control and its task data provider once mounted, and again for every rebuilt pair —
     * the grid recreates both when a view changes or a record is saved. This is the way in to everything
     * imperative: the task operations and `taskEvents`, the saved queries, the selection. The provider is
     * the same instance as `control.getDataset().getDataProvider()`, handed over already typed.
     *
     * The dataset refresh is kicked off just before this, not awaited, so the records are not loaded yet.
     * Subscribe to the data provider's own events (`onLoading`, `onBeforeFirstDataLoaded`) for that moment.
     */
    onReady?: (control: ITaskGridDatasetControl, taskDataProvider: ITaskDataProvider) => void;
    /**
     * Called for every error the grid reports — task operations, saved queries and templates alike.
     * The grid still shows its own error dialog; this is for logging or a notification of your own.
     */
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
    /** Called after a task was reordered or reparented. */
    onTaskMoved?: (movingTaskId: string, targetTaskId: string, position: 'above' | 'below' | 'child') => void;
    /** Called whenever the strategy hands back new raw data — after a move, a save that changed other rows, a manual `updateTaskData`. */
    onTaskDataUpdated?: (data: IRawRecord[]) => void;
    /** Called after the hierarchy was rebuilt, with the parents whose children changed. */
    onRecordTreeUpdated?: (updatedParentIds: (string | undefined)[]) => void;
    /** Called before the user's records are opened — a task, or a related record from a lookup. */
    onBeforeDatasetItemsOpened?: (entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean) => void;
    /** Called after an open completed, with whatever the strategy returned. */
    onDatasetItemsOpened?: (entityReferences: ComponentFramework.EntityReference[], isTaskEntity: boolean, result: IOpenDatasetItemsResult | null) => void;
    /** Called before a record is saved. */
    onBeforeRecordSaved?: (record: IRecord) => void;
    /** Called after a record was saved, with the fields that were written. */
    onRecordSaved?: (result: IRecordSaveOperationResult) => void;
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

interface IInternalTaskGridProps extends ITaskGridProps {
    datasetControl: ITaskGridDatasetControl;
    onRemountRequested: () => void;
}

//serves for keeping track of lifecycle
export const TaskGrid = (props: ITaskGridProps) => {
    const { taskGridDescriptor } = props;
    const stateRef = useRef<ITaskGridState>({});
    const components = { ...TaskGridComponents, ...props.components };
    const pcfContextRef = useRef(props.pcfContext);
    pcfContextRef.current = props.pcfContext;
    const localizationService = React.useMemo(() => new LocalizationService({ ...TASK_GRID_LABELS, ...props.labels }), []);

    const [instanceState, setInstanceState] = React.useState<{
        instance: ITaskGridDatasetControl;
        remountKey: number;
    } | null>(null);

    const createDatasetControlInstance = async () => {
        setInstanceState(null);
        const instance = await TaskGridDatasetControlFactory.createInstance({
            taskGridDescriptor,
            localizationService,
            state: stateRef.current,
            onGetPcfContext: () => pcfContextRef.current!,
        });
        setInstanceState(prev => ({ instance, remountKey: (prev?.remountKey ?? 0) + 1 }));
    };

    React.useEffect(() => {
        createDatasetControlInstance();
    }, []);

    if (!instanceState) {
        return components.onRenderSkeleton({
            height: taskGridDescriptor.onGetHeight?.() ?? '400px'
        })
    }

    return (
        <PcfContext.Provider value={pcfContextRef.current}>
            <LocalizationServiceContext.Provider value={localizationService}>
                <AgGridLicenseKeyContext.Provider value={taskGridDescriptor.onGetGridParameters?.()?.agGridLicenseKey ?? null}>
                    <TaskGridComponentsContext.Provider value={components}>
                        <InternalTaskGridDatasetControl
                            key={instanceState.remountKey}
                            {...props}
                            datasetControl={instanceState.instance}
                            onRemountRequested={createDatasetControlInstance}
                        />
                    </TaskGridComponentsContext.Provider>
                </AgGridLicenseKeyContext.Provider>
            </LocalizationServiceContext.Provider>
        </PcfContext.Provider>
    );
}
const InternalTaskGridDatasetControl = (props: IInternalTaskGridProps) => {
    const { datasetControl, onRemountRequested, taskGridDescriptor } = props;
    const theme = useTheme();
    const styles = React.useMemo(() => getDatasetControlStyles(theme), [theme]);
    const provider = datasetControl.getDataset().getDataProvider() as ITaskDataProvider;
    const rootElementId = `${datasetControl.getControlId()}-root`;

    useEventEmitter<IDatasetControlEvents>(datasetControl, 'onRemountRequested', onRemountRequested);
    useTaskGridEvents(props, datasetControl, provider);

    React.useEffect(() => {
        datasetControl.getDataset().refresh();
        props.onReady?.(datasetControl, provider);
    }, []);

    return <DatasetControlContext.Provider value={datasetControl}>
        <TaskDataProviderContext.Provider value={provider}>
            <TaskGridDescriptorContext.Provider value={taskGridDescriptor}>
                <RootElementIdContext.Provider value={rootElementId}>
                    <DatasetControlRenderer
                        onGetDatasetControlInstance={() => datasetControl}
                        onGetControlComponent={Grid}
                        onOverrideComponentProps={(props) => {
                            return {
                                ...props,
                                onRender: (props, defaultRender) => {
                                    return defaultRender({
                                        ...props,
                                        container: {
                                            ...props.container,
                                            id: rootElementId,
                                            className: `${props.container.className} ${styles.datasetControlRoot}`
                                        },
                                        onRenderHeader: (props, defaultRender) => <Header headerProps={props} defaultRender={defaultRender} />
                                    })
                                }
                            }
                        }} />
                </RootElementIdContext.Provider>
            </TaskGridDescriptorContext.Provider>
        </TaskDataProviderContext.Provider>
    </DatasetControlContext.Provider >
}