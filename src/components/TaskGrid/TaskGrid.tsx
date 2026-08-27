import { useEventEmitter } from "@hooks/useEventEmitter"
import { IDatasetControlEvents } from "@utils/dataset-control";
import { useRef } from "react";
import * as React from "react";
import { AgGridLicenseKeyContext, RootElementIdContext, ServicesContext, TaskGridComponentsContext } from "./context";
import { DatasetControl as DatasetControlRenderer } from "../DatasetControl";
import { useTheme } from "@fluentui/react";
import { getDatasetControlStyles } from "./styles";
import { Grid } from "./components/grid";
import { IDeleteTasksResult, IOpenDatasetItemsResult, ITaskDataProvider, ITaskDataProviderEventListener } from "./providers/task";
import { IDeletedUserQueriesResult } from "./providers/saved-query";
import { ITemplateDataProviderEvents } from "./providers/template";
import { ITaskGridLabels } from "./labels";
import { TASK_GRID_LABELS } from "./labels";
import { ITaskGridState, TaskGridDatasetControlFactory } from "./TaskGridDatasetControlFactory";
import type { ITaskGridServiceLocator } from "./services";
import { Header } from "./components/header/Header";
import { ITaskGridComponents, TaskGridComponents } from "./components/components";
import { ITaskGridDescriptor, ITaskGridDatasetControl } from "./interfaces";
import { LocalizationService, usePcfContext } from "@utils";
import { useTaskGridEvents } from "./useTaskGridEvents";
import { IDataProviderEventListeners, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";

/** Props for {@link TaskGrid}. */
export interface ITaskGridProps {
    /** Supplies every strategy and module the grid runs on. See {@link ITaskGridDescriptor}. */
    descriptor: ITaskGridDescriptor;
    /** Overrides for any subset of the UI strings. See {@link ITaskGridLabels}. */
    labels?: Partial<ITaskGridLabels>;
    /** Overrides for any subset of the replaceable components. See {@link ITaskGridComponents}. */
    components?: Partial<ITaskGridComponents>;
    /**
     * Called with the grid's service locator once mounted, and again on every remount — the grid rebuilds
     * everything when a view changes or a record is saved. The way in to everything imperative: the task
     * provider and its `taskEvents`, the saved queries, the control, the selection, every registered
     * module.
     *
     * The records are already loaded by then — the control's factory awaits the first load, so the grid
     * mounts on data rather than filling in afterwards.
     *
     * ```ts
     * onReady={services => {
     *     services.get('taskDataProvider').refresh()
     *     services.get('datasetControl').getSelectedRecordIds()
     * }}
     * ```
     */
    onReady?: (services: ITaskGridServiceLocator) => void;
    /**
     * Called before the grid is torn down — on unmount, and on every remount. Every provider still holds
     * its data, so this is where anything worth keeping is read off them.
     *
     * Nothing in the grid persists anything for you; this is the seam.
     *
     * ```ts
     * onBeforeDestroy={services => {
     *     records = services.get('taskDataProvider').getRawData()
     *     userQueries = services.find('userQueriesModule')?.provider.getQueries() ?? []
     * }}
     * ```
     */
    onBeforeDestroy?: (services: ITaskGridServiceLocator) => void;
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

/**
 * A hierarchical task grid. Everything it reads and writes comes from the descriptor, so this component
 * takes no data of its own.
 *
 * Reads the PCF context off `PcfContextProvider`, so render it inside one.
 *
 * Builds a control instance from the descriptor, showing the skeleton until it resolves, and rebuilds it
 * whenever the grid asks for a remount — a view change or a record save.
 */
export const TaskGrid = (props: ITaskGridProps) => {
    const { descriptor } = props;
    const stateRef = useRef<ITaskGridState>({});
    const components = { ...TaskGridComponents, ...props.components };
    const pcfContext = usePcfContext();
    const pcfContextRef = useRef(pcfContext);
    pcfContextRef.current = pcfContext;
    const localizationService = React.useMemo(() => new LocalizationService({ ...TASK_GRID_LABELS, ...props.labels }), []);

    const [instanceState, setInstanceState] = React.useState<{
        instance: ITaskGridDatasetControl;
        remountKey: number;
    } | null>(null);

    const createDatasetControlInstance = async () => {
        setInstanceState(null);
        const instance = await TaskGridDatasetControlFactory.createInstance({
            taskGridDescriptor: descriptor,
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
            height: descriptor.onGetHeight?.() ?? '400px'
        })
    }

    return (
        <AgGridLicenseKeyContext.Provider value={descriptor.onGetGridParameters?.()?.agGridLicenseKey ?? null}>
            <TaskGridComponentsContext.Provider value={components}>
                <InternalTaskGridDatasetControl
                    key={instanceState.remountKey}
                    {...props}
                    datasetControl={instanceState.instance}
                    onRemountRequested={createDatasetControlInstance}
                />
            </TaskGridComponentsContext.Provider>
        </AgGridLicenseKeyContext.Provider>
    );
}
const InternalTaskGridDatasetControl = (props: IInternalTaskGridProps) => {
    const { datasetControl, onRemountRequested, descriptor } = props;
    const theme = useTheme();
    const styles = React.useMemo(() => getDatasetControlStyles(theme), [theme]);
    const provider = datasetControl.getDataset().getDataProvider() as ITaskDataProvider;
    const rootElementId = `${datasetControl.getControlId()}-root`;

    useEventEmitter<IDatasetControlEvents>(datasetControl, 'onRemountRequested', onRemountRequested);
    useTaskGridEvents(props, datasetControl, provider);

    React.useEffect(() => {
        //no refresh here: the factory awaited the first load, so the records are already in
        props.onReady?.(datasetControl.getServices());
    }, []);

    //one context for everything the grid was built with; the hooks read what they need off it
    return <ServicesContext.Provider value={datasetControl.getServices()}>
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
    </ServicesContext.Provider>
}