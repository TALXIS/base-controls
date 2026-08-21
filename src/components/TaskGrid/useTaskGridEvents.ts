import { IDataProviderEventListeners, IRawRecord, IRecord, IRecordSaveOperationResult } from "@talxis/client-libraries";
import { useEventEmitter } from "@hooks/useEventEmitter";
import { IDeletedUserQueriesResult } from "./providers/saved-query";
import { IUserQueryDataProviderEvents } from "./modules/interfaces";
import { IDeleteTasksResult, IOpenDatasetItemsResult, ITaskDataProvider, ITaskDataProviderEventListener } from "./providers/task";
import { ITemplateDataProviderEvents } from "./providers/template";
import { ITaskGridDatasetControl } from "./interfaces";
import { ITaskGridProps } from "./TaskGrid";

/**
 * Forwards every event the grid raises to the matching prop on {@link ITaskGridProps}.
 *
 * All of these already exist on the providers; a parent has no way of reaching those emitters, so this
 * is the bridge. The three `onError` sources are funnelled into the single `onError` prop.
 */
export const useTaskGridEvents = (props: ITaskGridProps, datasetControl: ITaskGridDatasetControl, taskDataProvider: ITaskDataProvider) => {
    const { taskEvents } = taskDataProvider;
    //undefined when no user-queries module is registered; useEventEmitter tolerates that, so these
    //props simply never fire
    const queryEvents = datasetControl.getModules().userQueries?.provider.events;
    const templateEvents = datasetControl.isTemplatingEnabled() ? datasetControl.getTemplateDataProvider().templateEvents : undefined;

    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onBeforeTasksCreated', (parentTaskId?: string) => props.onBeforeTasksCreated?.(parentTaskId));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onAfterTasksCreated', (records: IRawRecord[] | null, parentTaskId?: string) => props.onTasksCreated?.(records, parentTaskId));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onBeforeTasksDeleted', (taskIds: string[]) => props.onBeforeTasksDeleted?.(taskIds));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onAfterTasksDeleted', (result: IDeleteTasksResult | null) => props.onTasksDeleted?.(result));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onBeforeTaskMoved', () => props.onBeforeTaskMoved?.());
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onAfterTaskMoved', (movingTaskId: string, targetTaskId: string, position: 'above' | 'below' | 'child') => props.onTaskMoved?.(movingTaskId, targetTaskId, position));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onTaskDataUpdated', (data: IRawRecord[]) => props.onTaskDataUpdated?.(data));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onRecordTreeUpdated', (updatedParentIds: (string | undefined)[]) => props.onRecordTreeUpdated?.(updatedParentIds));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onBeforeDatasetItemsOpened', (references: ComponentFramework.EntityReference[], isTaskEntity: boolean) => props.onBeforeDatasetItemsOpened?.(references, isTaskEntity));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onAfterDatasetItemsOpened', (references: ComponentFramework.EntityReference[], isTaskEntity: boolean, result: IOpenDatasetItemsResult | null) => props.onDatasetItemsOpened?.(references, isTaskEntity, result));
    useEventEmitter<ITaskDataProviderEventListener>(taskEvents, 'onError', (error: any, message: string) => props.onError?.(error, message));

    useEventEmitter<IUserQueryDataProviderEvents>(queryEvents, 'onBeforeUserQueryCreated', (queryName: string) => props.onBeforeUserQueryCreated?.(queryName));
    useEventEmitter<IUserQueryDataProviderEvents>(queryEvents, 'onAfterUserQueryCreated', (result: string | null) => props.onUserQueryCreated?.(result));
    useEventEmitter<IUserQueryDataProviderEvents>(queryEvents, 'onBeforeUserQueryUpdated', (queryId: string) => props.onBeforeUserQueryUpdated?.(queryId));
    useEventEmitter<IUserQueryDataProviderEvents>(queryEvents, 'onAfterUserQueryUpdated', (result: string | null) => props.onUserQueryUpdated?.(result));
    useEventEmitter<IUserQueryDataProviderEvents>(queryEvents, 'onBeforeUserQueriesDeleted', (queryIds: string[]) => props.onBeforeUserQueriesDeleted?.(queryIds));
    useEventEmitter<IUserQueryDataProviderEvents>(queryEvents, 'onAfterUserQueriesDeleted', (result: IDeletedUserQueriesResult) => props.onUserQueriesDeleted?.(result));
    useEventEmitter<IUserQueryDataProviderEvents>(queryEvents, 'onError', (error: any, message: string) => props.onError?.(error, message));

    useEventEmitter<ITemplateDataProviderEvents>(templateEvents, 'onBeforeTemplateCreated', (taskId: string) => props.onBeforeTemplateCreated?.(taskId));
    useEventEmitter<ITemplateDataProviderEvents>(templateEvents, 'onAfterTemplateCreated', (record: IRawRecord | null) => props.onTemplateCreated?.(record));
    useEventEmitter<ITemplateDataProviderEvents>(templateEvents, 'onError', (error: any, message: string) => props.onError?.(error, message));

    useEventEmitter<IDataProviderEventListeners>(taskDataProvider, 'onBeforeRecordSaved', (record: IRecord) => props.onBeforeRecordSaved?.(record));
    useEventEmitter<IDataProviderEventListeners>(taskDataProvider, 'onAfterRecordSaved', (result: IRecordSaveOperationResult) => props.onRecordSaved?.(result));
};
