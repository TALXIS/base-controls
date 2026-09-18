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
    ISingleRecord,
    Sanitizer,
} from "@talxis/client-libraries";
import {
    IDeleteTasksResult,
    IOpenDatasetItemsResult,
    ITaskCreateParams,
    ITaskDataProvider,
    ITaskMoveParams,
} from "@components/TaskGrid/providers";
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import { IDataverseProject } from "@components/TaskGrid/modules/project";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { StackRank } from "@utils/stack-rank";
import { IDataverseFieldMapping } from "@components/TaskGrid/descriptors/dataverse/DataverseTaskGridDescriptor";
import { LookupManyHandler } from "./LookupManyHandler";

/** The `Xrm.Navigation.navigateTo` arguments behind every form the grid opens. */
export interface IFormParameters {
    pageInput: Xrm.Navigation.PageInputEntityRecord;
    navigationOptions: Xrm.Navigation.NavigationOptions;
}

/** Which form an operation is about to open. */
export type DataverseFormOperation = 'create' | 'edit' | 'bulkEdit' | 'open';

/** The task entity and the grid's view of it — what every write needs to address a record. */
export interface IDataverseTaskEntity {
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

/**
 * What {@link IDataverseTaskStrategyParams.onGetNewTaskDefaults} is handed: everything needed to decide
 * what a task starts with, and nothing that performs the create.
 */
export interface IDataverseNewTaskDefaultsParams extends ITaskCreateParams, IDataverseTaskEntity {
    /** The project new tasks are linked to, as the project module resolved it. */
    project?: IDataverseProject;
    /** The record the grid is scoped by, when the descriptor supplied one. */
    sourceRecord?: ISingleRecord;
    /** When `true` the record is created straight through the Web API; otherwise a form is opened. */
    isInlineCreateEnabled: boolean;
}

/** What {@link DataverseTaskActions.createTask} needs. */
export interface IDataverseTaskCreateParams extends IDataverseNewTaskDefaultsParams, IDataverseTaskForms, IDataverseTaskRecords {
    /** The form to open when creating through a dialog. */
    createFormId?: string;
    /**
     * Extra values the new task starts with, keyed by column name — {@link IDataverseTaskStrategyParams.onGetNewTaskDefaults}.
     * The links the grid resolves are written on top of them.
     */
    onGetNewTaskDefaults?: (params: IDataverseNewTaskDefaultsParams) => Promise<Partial<IRawRecord>>;
}

/** What a new task starts with, split by who owns it. */
interface INewTaskValues {
    /** What the caller asked every new task to start with. */
    defaults: { [columnName: string]: any };
    /** Where the grid puts the task: its project, its parent task, and its rank among the siblings. */
    placement: { [columnName: string]: any };
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
 * The behaviour behind {@link DataverseTaskStrategy}, as static actions over the providers and names you
 * pass in. Call these directly when you write a task strategy of your own and want the shipped semantics
 * for part of it.
 *
 * Each {@link IDataverseTaskStrategyParams} hook receives the matching action's exact parameters, so an
 * override can forward them straight back.
 *
 * @example
 * ```ts
 * onDeleteTasks: async params => {
 *     await audit(params.taskIds);
 *     return DataverseTaskActions.deleteTasks(params);
 * },
 * ```
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
     * Creates one task: straight through the Web API when the grid creates inline, otherwise by opening
     * the create form and writing the task's placement on top of what was saved.
     *
     * @returns The created record, or `null` when the user closed the form without saving.
     */
    public static async createTask(params: IDataverseTaskCreateParams): Promise<IRawRecord | null> {
        const values = await this._getNewTaskValues(params);
        return params.isInlineCreateEnabled
            ? await this._createTaskThroughWebApi(values, params)
            : await this._createTaskThroughForm(values, params);
    }

    /**
     * Deletes tasks through the Web API, optionally cascading to descendants.
     *
     * Without `isDeletingTasksWithChildrenEnabled`, a task that still has children is left alone and
     * reported as an error rather than orphaning its subtree — and nothing below it is touched either, so
     * refusing a task can never cost it its children. The check is on what the grid asked for: a
     * descendant the cascade pulls in is a consequence of deleting its parent, not a delete of its own.
     *
     * Both the cascade and the check read the complete hierarchy, so the active filter cannot hide a
     * child from either.
     */
    public static async deleteTasks(params: IDataverseTaskDeleteParams): Promise<IDeleteTasksResult | null> {
        const { taskIds, provider, fetchXmlDataProvider, isCascadeDeleteEnabled, isDeletingTasksWithChildrenEnabled } = params;
        //the complete hierarchy, not the rendered one
        const structure = provider.getRecordTree().structure;
        const notDeletableTaskIds = isDeletingTasksWithChildrenEnabled
            ? []
            : taskIds.filter(taskId => structure.hasChildren(taskId));
        //resolved before the cascade, so a refused task is never the reason its subtree goes
        const refusedTaskIds = new Set(notDeletableTaskIds);
        const requestedTaskIds = taskIds.filter(taskId => !refusedTaskIds.has(taskId));
        const allTaskIds: Set<string> = new Set(requestedTaskIds);
        if (isCascadeDeleteEnabled) {
            for (const taskId of requestedTaskIds) {
                for (const descendant of structure.getDescendants(taskId)) {
                    allTaskIds.add(descendant.getRecordId());
                }
            }
        }

        const attemptedTaskIds = [...allTaskIds];
        const result = await fetchXmlDataProvider.deleteRecords(attemptedTaskIds);
        const failures = result.results.filter(result => !result.success);
        const failedTaskIds = new Set(failures.map(result => result.recordId));
        //what actually went, not what was attempted: the provider drops a row for every id reported here,
        //so a task whose delete failed has to stay out of it or it disappears while it still exists
        const deletedTaskIds = attemptedTaskIds.filter(taskId => !failedTaskIds.has(taskId));
        const errors = [
            ...failures.map(failure => ({ id: failure.recordId, error: failure.errorMessage })),
            //TODO: localize
            ...notDeletableTaskIds.map(taskId => ({ id: taskId, error: 'Cannot delete task with children.' })),
        ];
        if (errors.length === 0) {
            return { success: true, deletedTaskIds };
        }
        return { success: false, deletedTaskIds, errors };
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

    // ── Creating a task ──────────────────────────────────────────────────────

    //everything a new task starts with, keyed by column: the caller's defaults, and the placement the grid resolves —
    //the project, the parent task, and the rank that puts it before its siblings. Lookups stay entity references here;
    //what a Dataverse create makes of them is the converters' job.
    private static async _getNewTaskValues(params: IDataverseTaskCreateParams): Promise<INewTaskValues> {
        const { parentRecord, previousSibling, nextSibling, fieldMapping, provider, project, onGetNewTaskDefaults, data } = params;
        const placement: { [columnName: string]: any } = {};
        if (project && fieldMapping.projectId) {
            placement[fieldMapping.projectId] = this._getProjectLookup(project);
        }
        const parentTaskId = parentRecord?.getRecordId();
        if (parentTaskId) {
            placement[fieldMapping.parentId] = provider.getRecordsMap()[parentTaskId].getNamedReference();
        }
        //between the neighbours the create asked for, and before every existing sibling the provider
        //resolved when it asked for none - filtered out of the view or not
        placement[fieldMapping.stackRank] = StackRank.between(
            this._getStackRank(previousSibling, fieldMapping),
            this._getStackRank(nextSibling, fieldMapping)
        );
        return {
            //the caller's own values last, over what the consumer defaults every new task to
            defaults: { ...await onGetNewTaskDefaults?.(params) ?? {}, ...data },
            placement: placement,
        };
    }

    //creates the task through the Web API, values and placement in one body.
    private static async _createTaskThroughWebApi(values: INewTaskValues, params: IDataverseTaskCreateParams): Promise<IRawRecord | null> {
        const { entityName, onGetRawRecords } = params;
        const payload = await this._toWebApiPayload({ ...values.defaults, ...values.placement }, entityName);
        const result = await window.Xrm.WebApi.createRecord(entityName, payload);
        return (await onGetRawRecords([result.id]))[0];
    }

    //opens the create form with the values prefilled, then writes the placement onto what was saved — the rank the form
    //has no field for, and the links the grid resolved. The defaults are not written again: they reached the form as
    //prefill, and what the user did with them there is what the task keeps.
    private static async _createTaskThroughForm(values: INewTaskValues, params: IDataverseTaskCreateParams): Promise<IRawRecord | null> {
        const { entityName, createFormId, onGetFormParameters, onGetRawRecords } = params;
        const { pageInput, navigationOptions } = onGetFormParameters('create', {
            pageInput: {
                pageType: 'entityrecord',
                entityName: entityName,
                data: this._toFormPrefill({ ...values.defaults, ...values.placement }),
                formId: createFormId,
            },
            navigationOptions: this._getFormNavigationOptions(),
        });
        const navigateToResult = await Xrm.Navigation.navigateTo(pageInput, navigationOptions);
        if (!navigateToResult.savedEntityReference) {
            return null;
        }
        const entityReference = Sanitizer.Lookup.getEntityReference(navigateToResult.savedEntityReference[0]);
        await window.Xrm.WebApi.updateRecord(entityName, entityReference.id.guid, await this._toWebApiPayload(values.placement, entityName));
        return (await onGetRawRecords([entityReference.id.guid]))[0];
    }

    //the values as the `data` a create form reads: a lookup becomes the three keys the form binds to, everything else
    //is written as it came.
    private static _toFormPrefill(values: { [columnName: string]: any }): { [key: string]: any } {
        const data: { [key: string]: any } = {};
        for (const [columnName, value] of Object.entries(values)) {
            const reference = this._getLookupReference(value);
            if (!reference) {
                data[columnName] = value;
                continue;
            }
            data[columnName] = reference.id.guid;
            data[`${columnName}name`] = reference.name;
            data[`${columnName}type`] = reference.etn;
        }
        return data;
    }

    //the same values as a Web API body: a lookup becomes the `@odata.bind` its navigation property and the target's
    //entity set spell out, everything else is written as it came.
    private static async _toWebApiPayload(values: { [columnName: string]: any }, entityName: string): Promise<{ [key: string]: any }> {
        const payload: { [key: string]: any } = {};
        for (const [columnName, value] of Object.entries(values)) {
            const reference = this._getLookupReference(value);
            if (!reference) {
                payload[columnName] = value;
                continue;
            }
            const referencedMetadata = await window.Xrm.Utility.getEntityMetadata(reference.etn!);
            payload[`${await this._getNavigationalPropertyName(entityName, reference.etn!, columnName)}@odata.bind`] =
                `/${referencedMetadata.EntitySetName}(${reference.id.guid})`;
        }
        return payload;
    }

    //the project as a lookup value, which is the one shape a Dataverse write can bind to
    private static _getProjectLookup(project: IDataverseProject): ComponentFramework.EntityReference {
        return { id: { guid: project.id }, name: project.name ?? '', etn: project.data.entityName };
    }

    //the entity reference behind a value, whether it arrived bare or as the array a lookup column holds.
    private static _getLookupReference(value: any): ComponentFramework.EntityReference | null {
        const candidate = Array.isArray(value) ? value[0] : value;
        return candidate?.id?.guid && candidate?.etn ? candidate as ComponentFramework.EntityReference : null;
    }

    // ── Forms ────────────────────────────────────────────────────────────────

    //the side dialog every form opens in, unless the consumer overrides the parameters.
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

    //A sibling's rank, read off the record the provider resolved.
    private static _getStackRank(sibling: IRecord | undefined, fieldMapping: IDataverseFieldMapping): string | undefined {
        return sibling?.getValue(fieldMapping.stackRank) as string | undefined;
    }

    //the navigation property behind a lookup column, resolved from the entity's relationships.
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
