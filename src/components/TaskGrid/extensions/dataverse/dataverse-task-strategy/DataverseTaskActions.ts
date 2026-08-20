import {
    DatasetConstants,
    FetchXmlDataProvider,
    IAvailableColumnOptions,
    IAvailableRelatedColumn,
    IColumn,
    IFetchXmlDataProvider,
    IRawRecord,
    IRecord,
    IRecordSaveOperationResult,
    Sanitizer,
} from "@talxis/client-libraries";
import {
    ICustomColumnsDataProvider,
    IDeleteTasksResult,
    IOpenDatasetItemsResult,
    ITaskCreateParams,
    ITaskDataProvider,
    ITaskMoveParams,
    ITaskTemplateExpansionParams,
} from "@components/TaskGrid/providers";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { StackRank } from "@components/TaskGrid/stack-rank";
import { IDataverseFieldMapping } from "../DataverseTaskGridDescriptor";
import { LookupManyHandler } from "../lookup-many/LookupManyHandler";

/** The `Xrm.Navigation.navigateTo` arguments behind every form the grid opens. */
export interface IFormParameters {
    pageInput: Xrm.Navigation.PageInputEntityRecord;
    navigationOptions: Xrm.Navigation.NavigationOptions;
}

/** Which form an operation is about to open. */
export type DataverseFormOperation = 'create' | 'edit' | 'bulkEdit' | 'open';

/** The task entity and the grid's view of it — what every write needs to address a record. */
interface IDataverseTaskEntity {
    /** The task entity's logical name. */
    entityName: string;
    /** The task entity set, used to build `@odata.bind` payloads. */
    entitySetName: string;
    /** The columns the descriptor mapped onto their roles (parent, stack rank, project, state code). */
    fieldMapping: IDataverseFieldMapping;
    /**
     * The grid's data provider — the source of the records, their raw data and the hierarchy. Read at
     * call time so an action always sees the tree the user is looking at.
     */
    provider: ITaskDataProvider;
}

/** What an action that opens a form needs. */
interface IDataverseTaskForms {
    /**
     * Resolves the `navigateTo` arguments, already routed through the consumer's
     * `form.onGetFormParameters` when one was supplied.
     */
    onGetFormParameters: (operation: DataverseFormOperation, defaultParameters: IFormParameters) => IFormParameters;
}

/** What an action that writes and then re-reads needs. */
interface IDataverseTaskRecords {
    /**
     * Re-reads records from the Web API — the strategy's own `onGetRawRecords`, so lookup-many and
     * custom-column values come back resolved.
     */
    onGetRawRecords: (ids: string[]) => Promise<IRawRecord[]>;
}

/** What {@link DataverseTaskActions.isRecordActive} reads. */
export interface IDataverseTaskActivityParams {
    /** The task record to judge. */
    record: IRecord;
    /** The physical field names the descriptor mapped. Only `stateCode` is read. */
    nativeColumns: INativeColumns;
}

/** What {@link DataverseTaskActions.getAvailableColumns} reads. */
export interface IDataverseTaskAvailableColumnsParams {
    /** The FetchXML provider that loaded the tasks — it knows the entity's attributes. */
    fetchXmlDataProvider: IFetchXmlDataProvider;
    /** Whatever the Edit columns panel asked for. */
    options?: IAvailableColumnOptions;
}

/** What {@link DataverseTaskActions.getAvailableRelatedColumns} reads. */
export interface IDataverseTaskAvailableRelatedColumnsParams {
    /** The FetchXML provider that loaded the tasks — it knows the entity's relationships. */
    fetchXmlDataProvider: IFetchXmlDataProvider;
}

/** What {@link DataverseTaskActions.createTask} needs. */
export interface IDataverseTaskCreateParams extends ITaskCreateParams, IDataverseTaskEntity, IDataverseTaskForms, IDataverseTaskRecords {
    /** When `true` the record is created straight through the Web API; otherwise a form is opened. */
    isInlineCreateEnabled: boolean;
    /** The form to open when creating through a dialog. */
    createFormId?: string;
    /** The project new tasks are linked to, when the descriptor supplied one. */
    projectReference?: ComponentFramework.EntityReference;
    /** The project entity's metadata — its entity set completes the `@odata.bind` value. */
    projectMetadata?: Xrm.Metadata.EntityMetadata;
}

/** What {@link DataverseTaskActions.deleteTasks} needs. */
export interface IDataverseTaskDeleteParams {
    /** The tasks the grid asked to delete. */
    taskIds: string[];
    /** The hierarchy, for resolving descendants and for the has-children check. */
    provider: ITaskDataProvider;
    /** The provider that performs the deletes. */
    fetchXmlDataProvider: IFetchXmlDataProvider;
    /** When `true`, descendants are deleted along with the tasks asked for. */
    isCascadeDeleteEnabled: boolean;
    /** When `false`, a task that still has children is refused rather than deleted. */
    isDeletingTasksWithChildrenEnabled: boolean;
}

/** What {@link DataverseTaskActions.createTasksFromTemplate} would need. */
export interface IDataverseTaskTemplateExpansionParams extends ITaskTemplateExpansionParams {
}

/** What {@link DataverseTaskActions.openDatasetItems} needs. */
export interface IDataverseTaskOpenParams extends IDataverseTaskForms, IDataverseTaskRecords {
    /** The records the user asked to open. */
    entityReferences: ComponentFramework.EntityReference[];
    /** `true` when they are tasks, `false` for a related record reached from a lookup. */
    isTaskEntity: boolean;
    /** The task entity's logical name. */
    entityName: string;
    /** Whether the grid allows editing — passed to the task form as `isEditingEnabled`. */
    isTaskEditingEnabled: boolean;
    /** The form to open for a single task. */
    editFormId?: string;
    /** The form to open for a multi-record edit. */
    bulkEditFormId?: string;
}

/** What {@link DataverseTaskActions.moveTask} needs. */
export interface IDataverseTaskMoveParams extends ITaskMoveParams, IDataverseTaskEntity, IDataverseTaskRecords {
}

/** What {@link DataverseTaskActions.saveRecord} needs. */
export interface IDataverseTaskSaveParams {
    /** The edited record. TaskGrid auto-saves, so exactly one dirty field is expected. */
    record: IRecord;
    /** The provider that owns the standard save path. */
    fetchXmlDataProvider: IFetchXmlDataProvider;
    /** The provider that owns user-defined column values, when the feature is on. */
    customColumnsDataProvider?: ICustomColumnsDataProvider;
    /** Resolves the handler that persists one lookup-many column. */
    onGetLookupManyHandler: (columnName: string) => LookupManyHandler;
}

/**
 * The behaviour behind `DataverseTaskStrategy`, as actions over the providers and names you pass in —
 * no state of its own, nothing resolved from a descriptor.
 *
 * The strategy is the thin part: it resolves the FetchXML, builds the providers and keeps the consumer's
 * overrides, and every one of its hooks is "call the override if there is one, otherwise call the action
 * here". So each override receives exactly the action's parameters and can forward them straight back:
 *
 * ```ts
 * onDeleteTasks: async params => {
 *     await audit(params.taskIds);
 *     return DataverseTaskActions.deleteTasks(params);
 * },
 * ```
 *
 * Call these directly when you write a task strategy of your own and want the shipped semantics for
 * part of it.
 */
export class DataverseTaskActions {
    /** The default rule: a task is active while its state code is `0`. */
    public static isRecordActive(params: IDataverseTaskActivityParams): boolean {
        return params.record.getValue(params.nativeColumns.stateCode) == 0;
    }

    /** The column catalogue the Edit columns panel offers, from the task entity's attributes. */
    public static async getAvailableColumns(params: IDataverseTaskAvailableColumnsParams): Promise<IColumn[]> {
        return params.fetchXmlDataProvider.getAvailableColumns(params.options);
    }

    /** The related-column catalogue, walked from the task entity's relationships. */
    public static async getAvailableRelatedColumns(params: IDataverseTaskAvailableRelatedColumnsParams): Promise<IAvailableRelatedColumn[]> {
        return params.fetchXmlDataProvider.getAvailableRelatedColumns();
    }

    /**
     * Creates one task, either straight through the Web API or by opening the create form.
     *
     * The new task is ranked before its first sibling, and pre-linked to the project and the parent.
     *
     * @returns The created record, or `null` when the user closed the form without saving.
     */
    public static async createTask(params: IDataverseTaskCreateParams): Promise<IRawRecord | null> {
        const {
            parentRecord, nextSibling, entityName, entitySetName, fieldMapping, provider, isInlineCreateEnabled,
            createFormId, projectReference, projectMetadata, onGetFormParameters, onGetRawRecords,
        } = params;
        const parentTaskId = parentRecord?.getRecordId();
        const data: { [key: string]: any } = {};
        let pageInput: Xrm.Navigation.PageInputEntityRecord = {
            pageType: 'entityrecord',
            entityName: entityName,
            data: data,
            formId: createFormId
        };
        //prefill project
        if (projectReference) {
            const projectIdColumnName = fieldMapping.projectId;
            data[`${projectIdColumnName}`] = projectReference.id.guid;
            data[`${projectIdColumnName}name`] = projectReference.name;
            data[`${projectIdColumnName}type`] = projectReference.etn;
        }
        //prefill parent task
        if (parentTaskId) {
            const parentIdColumnName = fieldMapping.parentId;
            data[`${parentIdColumnName}`] = parentTaskId;
            data[`${parentIdColumnName}name`] = provider.getRecordsMap()[parentTaskId].getNamedReference().name;
            data[`${parentIdColumnName}type`] = entityName;
        }
        let payload: { [key: string]: any } = {};
        //before every existing sibling the provider resolved, filtered out of the view or not
        payload[`${fieldMapping.stackRank}`] = StackRank.between(undefined, this._getStackRank(nextSibling, fieldMapping));

        if (projectReference) {
            payload[`${await this._getNavigationalPropertyName(entityName, projectReference.etn!, fieldMapping.projectId!)}@odata.bind`] = `/${projectMetadata?.EntitySetName}(${projectReference.id.guid})`;
        }
        if (parentTaskId) {
            payload[`${await this._getNavigationalPropertyName(entityName, entityName, fieldMapping.parentId)}@odata.bind`] = `/${entitySetName}(${parentTaskId})`;
        }
        if (isInlineCreateEnabled) {
            const result = await window.Xrm.WebApi.createRecord(entityName, payload);
            const rawRecord = (await onGetRawRecords([result.id]))[0];
            return rawRecord;
        }

        const { pageInput: resolvedPageInput, navigationOptions: resolvedNavigationOptions } = onGetFormParameters('create', {
            pageInput,
            navigationOptions: this._getFormNavigationOptions()
        });
        const navigateToResult = await Xrm.Navigation.navigateTo(resolvedPageInput, resolvedNavigationOptions);
        if (navigateToResult.savedEntityReference) {
            const entityReference = Sanitizer.Lookup.getEntityReference(navigateToResult.savedEntityReference[0]);
            await window.Xrm.WebApi.updateRecord(entityName, entityReference.id.guid, payload);
            const rawRecord = (await onGetRawRecords([entityReference.id.guid]))[0];
            return rawRecord;
        }
        else {
            return null;
        }
    }

    /**
     * Deletes tasks through the Web API, optionally cascading to descendants.
     *
     * Without `isDeletingTasksWithChildrenEnabled`, a task that still has children is left alone and
     * reported as an error rather than orphaning its subtree. Both the cascade and that check read the
     * complete hierarchy, so the active filter cannot hide a child from either.
     */
    public static async deleteTasks(params: IDataverseTaskDeleteParams): Promise<IDeleteTasksResult | null> {
        const { taskIds, provider, fetchXmlDataProvider, isCascadeDeleteEnabled, isDeletingTasksWithChildrenEnabled } = params;
        //the complete hierarchy, not the rendered one: a child the active view hides is still a child,
        //and cascading over the filtered tree used to orphan it
        const structure = provider.getRecordTree().structure;
        const allTaskIds: Set<string> = new Set(taskIds);
        let success = true;
        const notDeletableTaskIds: string[] = [];
        if (isCascadeDeleteEnabled) {
            for (const taskId of taskIds) {
                for (const descendant of structure.getDescendants(taskId)) {
                    allTaskIds.add(descendant.getRecordId());
                }
            }
        }
        if (!isDeletingTasksWithChildrenEnabled) {
            for (const taskId of allTaskIds) {
                if (structure.hasChildren(taskId)) {
                    success = false;
                    allTaskIds.delete(taskId);
                    notDeletableTaskIds.push(taskId);
                }
            }
        }
        const result = await fetchXmlDataProvider.deleteRecords([...allTaskIds]);
        return {
            success: result.success && success,
            deletedTaskIds: [...allTaskIds],
            errors: [...result.results.filter(result => !result.success).map(result => {
                return {
                    id: result.recordId,
                    error: result.errorMessage
                }
            }), ...notDeletableTaskIds.map(id => {
                return {
                    id,
                    //TODO: localize
                    error: 'Cannot delete task with children.'
                }
            })]
        }
    }

    /**
     * Expanding a template has no Dataverse implementation — templates are a memory feature today, so
     * this throws. Supply `onCreateTasksFromTemplate` to implement it against your own model.
     */
    public static createTasksFromTemplate(_params: IDataverseTaskTemplateExpansionParams): Promise<IRawRecord[] | null> {
        throw new Error("Method not implemented.");
    }

    /**
     * Opens the records the user asked for: the related record's form, the task form, or the bulk-edit
     * form for a multi-record selection.
     *
     * @returns The records as they are after the form closed, so the grid can pick up the edits.
     */
    public static async openDatasetItems(params: IDataverseTaskOpenParams): Promise<IOpenDatasetItemsResult | null> {
        const { entityReferences, isTaskEntity, onGetFormParameters } = params;
        if (!isTaskEntity) {
            // Navigate to related entity (lookup target)
            const { pageInput, navigationOptions } = onGetFormParameters('open', {
                pageInput: {
                    pageType: 'entityrecord',
                    entityName: entityReferences[0].etn!,
                    entityId: entityReferences[0].id.guid,
                },
                navigationOptions: this._getFormNavigationOptions()
            });
            await window.Xrm.Navigation.navigateTo(pageInput, navigationOptions);
            return null;
        }
        if (entityReferences.length === 1) {
            const rawRecord = await this._editSingleTask(entityReferences[0].id.guid, params);
            if (!rawRecord) return null;
            return { success: true, updatedRecords: [rawRecord] };
        }
        return await this._editMultipleTasks(entityReferences.map(ref => ref.id.guid), params);
    }

    /**
     * Reorders or reparents a task: rewrites its parent lookup and gives it a LexoRank between its new
     * neighbours, then re-reads the record.
     */
    public static async moveTask(params: IDataverseTaskMoveParams): Promise<IRawRecord[] | null> {
        const { movingTaskId, parentRecord, previousSibling, nextSibling, entityName, entitySetName, fieldMapping, onGetRawRecords } = params;
        const parentTaskId = parentRecord?.getRecordId();
        const parentNavigationProperty = await this._getNavigationalPropertyName(entityName, entityName, fieldMapping.parentId);
        const payload: { [key: string]: any } = {
            [`${parentNavigationProperty}@odata.bind`]: parentTaskId ? `/${entitySetName}(${parentTaskId})` : null,
            //the provider resolved the neighbours over the whole dataset, so this cannot collide with a
            //sibling the active view happens to hide
            [fieldMapping.stackRank]: StackRank.between(
                this._getStackRank(previousSibling, fieldMapping),
                this._getStackRank(nextSibling, fieldMapping),
            ),
        };
        await window.Xrm.WebApi.updateRecord(entityName, movingTaskId, payload);
        const rawRecord = (await onGetRawRecords([movingTaskId]))[0];
        return [rawRecord];
    }

    /**
     * Saves a single dirty field on a task record.
     *
     * Lookup-many fields are persisted through their dedicated {@link LookupManyHandler}, user-defined
     * columns through the custom-columns provider; everything else takes the standard FetchXML save
     * path. TaskGrid auto-saves, so exactly one dirty field is expected per call.
     */
    public static async saveRecord(params: IDataverseTaskSaveParams): Promise<IRecordSaveOperationResult> {
        const { record, fetchXmlDataProvider, customColumnsDataProvider, onGetLookupManyHandler } = params;
        const dirtyField = record.getFields().find(field => field.isDirty());
        const column = dirtyField?.getColumn();
        if (column?.metadata?.LookupMany) {
            const handler = onGetLookupManyHandler(column.name);
            return handler.saveRecord(record, column.name);
        }
        else if (column?.name.endsWith(DatasetConstants.CUSTOM_COLUMN_NAME_SUFFIX)) {
            return customColumnsDataProvider!.saveValue(record.getRecordId(), column, dirtyField?.getValue());
        }
        else {
            return (<FetchXmlDataProvider>fetchXmlDataProvider).onRecordSave(record);
        }
    }

    // ── Forms ────────────────────────────────────────────────────────────────

    /** The side dialog every form opens in, unless the consumer overrides the parameters. */
    private static _getFormNavigationOptions(): Xrm.Navigation.NavigationOptions {
        return {
            target: 2,
            width: { value: 80, unit: '%' },
            position: 1,
        };
    }

    private static async _editSingleTask(recordId: string, params: IDataverseTaskOpenParams): Promise<IRawRecord | null> {
        const { entityName, editFormId, isTaskEditingEnabled, onGetFormParameters, onGetRawRecords } = params;
        const { pageInput, navigationOptions } = onGetFormParameters('edit', {
            pageInput: {
                pageType: 'entityrecord',
                entityName: entityName,
                entityId: recordId,
                formId: editFormId,
                data: {
                    isEditingEnabled: isTaskEditingEnabled
                }
            },
            navigationOptions: this._getFormNavigationOptions()
        })

        await window.Xrm.Navigation.navigateTo(pageInput, navigationOptions);
        const result = await onGetRawRecords([recordId]);
        return result[0];
    }

    private static async _editMultipleTasks(recordIds: string[], params: IDataverseTaskOpenParams): Promise<IOpenDatasetItemsResult | null> {
        const { entityName, bulkEditFormId, onGetFormParameters, onGetRawRecords } = params;
        const { pageInput, navigationOptions } = onGetFormParameters('bulkEdit', {
            //@ts-ignore - not documented, passing of record id array is possible in Power Apps - https://butenko.pro/2021/10/14/howto-open-bulk-editing-of-records-using-xrm-navigation-navigateto/
            pageInput: {
                //@ts-ignore - typings
                pageType: 'bulkedit',
                entityName: entityName,
                entityIds: recordIds,
                formId: bulkEditFormId
            },
            navigationOptions: {
                target: 2,
                position: 2,
            }
        });
        await window.Xrm.Navigation.navigateTo(pageInput, navigationOptions);
        const rawRecords = await onGetRawRecords(recordIds);
        return { success: true, updatedRecords: rawRecords };
    }

    // ── Relationships and ranking ────────────────────────────────────────────

    /** A sibling's rank, read off the record the provider resolved. */
    private static _getStackRank(sibling: IRecord | undefined, fieldMapping: IDataverseFieldMapping): string | undefined {
        return sibling?.getValue(fieldMapping.stackRank) as string | undefined;
    }

    /** The navigation property behind a lookup column, resolved from the entity's relationships. */
    private static async _getNavigationalPropertyName(entityName: string, referencedEntityName: string, referencingAttribute: string): Promise<string> {
        const metadata: any = await window.Xrm.Utility.getEntityMetadata(entityName);
        const relationship = metadata.ManyToOneRelationships.getAll().find((rel: any) =>
            rel.ReferencedEntity === referencedEntityName &&
            rel.ReferencingAttribute === referencingAttribute
        );
        if (!relationship) {
            throw new Error(`Could not find many-to-one relationship targeting ${referencedEntityName} on ${metadata.LogicalName}`);
        }
        return relationship.ReferencingEntityNavigationPropertyName;
    }
}
