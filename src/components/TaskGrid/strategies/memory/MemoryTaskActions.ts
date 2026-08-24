import {
    IAvailableColumnOptions,
    IAvailableRelatedColumn,
    IColumn,
    IMemoryProviderEntityMetadata,
    IRawRecord,
    IRecord,
    IRecordSaveOperationResult,
} from "@talxis/client-libraries";
import {
    IDeleteTasksResult,
    IOpenDatasetItemsResult,
    ISavedQueryDataProvider,
    ITaskCreateParams,
    ITaskMoveParams,
    ITaskTemplateExpansionParams,
} from "@components/TaskGrid/providers";
import { IRecordStructure } from "@components/TaskGrid/providers/task/record-tree";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { StackRank } from "@components/TaskGrid/stack-rank";
import { IMemoryTaskTemplateNode } from "@components/TaskGrid/modules/templates/memory/interfaces";
import { MemoryTemplateDataProvider } from "@components/TaskGrid/modules/templates/memory/MemoryTemplateDataProvider";

/** What every action that resolves a task by id needs. */
interface IMemoryTaskLookup {
    /**
     * Resolves the grid's record instance for a task — `provider.getRecordsMap()[taskId]`, keyed over every
     * loaded record rather than the filtered view.
     */
    onGetRecord: (taskId: string) => IRecord | undefined;
}

/** The records an action reads, and the names it needs to read a task apart. */
interface IMemoryTaskStore {
    /**
     * The provider's current records, read at call time. The actions never add to or remove from this
     * array — membership is the provider's job, it applies whatever an operation returns. They do write
     * *into* the record objects, which are the same objects the provider holds.
     */
    records: IRawRecord[];
    /** Entity metadata. `PrimaryIdAttribute` is required; `LogicalName` is used for parent lookups. */
    metadata: IMemoryProviderEntityMetadata;
    /** The physical field names the descriptor mapped, resolved by the provider. */
    nativeColumns: INativeColumns;
}

/** What {@link MemoryTaskActions.isRecordActive} reads. */
export interface IMemoryTaskActivityParams {
    /** The task record to judge. */
    record: IRecord;
    /** The physical field names the descriptor mapped. Only `stateCode` is read. */
    nativeColumns: INativeColumns;
}

/** What {@link MemoryTaskActions.getAvailableColumns} reads. */
export interface IMemoryTaskAvailableColumnsParams {
    /** The provider holding the system and user views the catalogue is built from. */
    savedQueryDataProvider: ISavedQueryDataProvider;
    /** Whatever the Edit columns panel asked for. Unused by the default implementation. */
    options?: IAvailableColumnOptions;
}

/** What {@link MemoryTaskActions.getAvailableRelatedColumns} reads. */
export interface IMemoryTaskAvailableRelatedColumnsParams {
    /** The task entity metadata — the entity any related column would be reached from. */
    metadata: IMemoryProviderEntityMetadata;
}

/** What {@link MemoryTaskActions.createTask} reads. */
export interface IMemoryTaskCreateParams extends ITaskCreateParams, IMemoryTaskStore {
    /** The active view's columns — every one of them starts out `null` on the new record. */
    columns: IColumn[];
    /** The consumer's field defaults for a new task. */
    onGetNewTaskDefaults?: (parentTaskId?: string) => Partial<IRawRecord>;
}

/** What {@link MemoryTaskActions.deleteTasks} reads. */
export interface IMemoryTaskDeleteParams extends IMemoryTaskLookup {
    /** The tasks the grid asked to delete. */
    taskIds: string[];
    /** The complete hierarchy, which is where the descendants to delete with them come from. */
    structure: IRecordStructure;
}

/** What {@link MemoryTaskActions.createTasksFromTemplate} reads. */
export interface IMemoryTaskTemplateExpansionParams extends ITaskTemplateExpansionParams, IMemoryTaskStore {
    /** The provider holding the template and its child hierarchy. */
    templateDataProvider: MemoryTemplateDataProvider;
    /** The active view's columns — the fields a template can carry over. */
    columns: IColumn[];
    /** The consumer's field defaults, applied under the template's own values. */
    onGetNewTaskDefaults?: (parentTaskId?: string) => Partial<IRawRecord>;
}

/** What {@link MemoryTaskActions.openDatasetItems} reads. */
export interface IMemoryTaskOpenParams {
    /** The records the user asked to open. */
    entityReferences: ComponentFramework.EntityReference[];
    /** `true` when they are tasks, `false` for a related record reached from a lookup. */
    isTaskEntity: boolean;
    /** Whether the grid allows editing — a form opened for a task should honour it. */
    isTaskEditingEnabled: boolean;
}

/** What {@link MemoryTaskActions.moveTask} reads and writes. */
export interface IMemoryTaskMoveParams extends ITaskMoveParams, IMemoryTaskStore {
}

/** What {@link MemoryTaskActions.saveRecord} reads and writes. */
export interface IMemoryTaskSaveParams extends IMemoryTaskLookup {
    /** The edited record. Its dirty fields are written onto the stored task. */
    record: IRecord;
}

/**
 * The behaviour behind {@link MemoryTaskStrategy}, as static actions over the records and column names you
 * pass in. Call these directly when you write a task strategy of your own and want the shipped semantics
 * for part of it.
 *
 * Each {@link IMemoryTaskStrategyParams} hook receives the matching action's exact parameters, so an
 * override can forward them straight back.
 *
 * @example
 * ```ts
 * onDeleteTasks: async params => {
 *     await audit(params.taskIds);
 *     return MemoryTaskActions.deleteTasks(params);
 * },
 * ```
 */
export class MemoryTaskActions {
    /**
     * The default rule behind `ITaskDataProviderStrategy.onIsRecordActive`: a task is active while its
     * state code is `0`. Inactive tasks are what the grid strikes through and what *Hide inactive*
     * filters out.
     *
     * @returns `true` when the task counts as active.
     */
    public static isRecordActive(params: IMemoryTaskActivityParams): boolean {
        //loose comparison: Field._sanitizeValue stringifies option-set values, so a
        //statecode reads back as "0" rather than 0
        return params.record.getValue(params.nativeColumns.stateCode) == 0;
    }

    /**
     * The column catalogue the Edit columns panel offers: every column defined by any view, system
     * queries first.
     */
    public static getAvailableColumns(params: IMemoryTaskAvailableColumnsParams): IColumn[] {
        const { savedQueryDataProvider } = params;
        const queries = [
            ...savedQueryDataProvider.getSystemQueries(),
            ...savedQueryDataProvider.getUserQueries(),
        ];
        const columns = new Map<string, IColumn>();
        for (const column of queries.flatMap(query => query.columns)) {
            //first definition wins, and system queries come first: a user query only stores a stripped
            //column, so letting it override would lose the display name and the metadata
            if (!columns.has(column.name)) {
                columns.set(column.name, column);
            }
        }
        //offered visible, whatever the views say: `isHidden` on a saved query column means "not in that
        //view", and the Edit columns panel drops a column it is handed hidden
        return [...columns.values()].map(column => ({ ...column, isHidden: false }));
    }

    /**
     * The related-column catalogue, which in-memory data has no way to discover: there is no
     * relationship metadata to walk, so nothing is offered.
     */
    public static getAvailableRelatedColumns(_params: IMemoryTaskAvailableRelatedColumnsParams): IAvailableRelatedColumn[] {
        return [];
    }

    /**
     * Builds one task, ranked first among its siblings.
     *
     * Returning it is what creates it: the provider adds whatever this hands back to its dataset.
     */
    public static createTask(params: IMemoryTaskCreateParams): IRawRecord {
        return this._buildTask({
            ...params,
            parentTaskId: params.parentRecord?.getRecordId() ?? null,
            //before every existing sibling, filtered out of the view or not
            stackRank: StackRank.between(undefined, this._getStackRank(params.nextSibling, params.nativeColumns)),
            parentReference: this._getParentReference(params.parentRecord),
        });
    }

    /**
     * Resolves which tasks a delete should take: the ones asked for, plus everything beneath them.
     *
     * The provider performs the delete over the returned `deletedTaskIds`, so this only decides the set.
     * Ids that no longer exist are reported as errors, and whatever did resolve is still deleted.
     */
    public static deleteTasks(params: IMemoryTaskDeleteParams): IDeleteTasksResult {
        const { taskIds, structure, onGetRecord } = params;
        const toDelete = new Set<string>();
        const missingTaskIds: string[] = [];
        for (const id of taskIds) {
            if (!onGetRecord(id)) {
                missingTaskIds.push(id);
                continue;
            }
            //the complete hierarchy: a child the active view hides is still a child
            toDelete.add(id);
            for (const descendant of structure.getDescendants(id)) {
                toDelete.add(descendant.getRecordId());
            }
        }
        const deletedTaskIds = [...toDelete];
        if (missingTaskIds.length > 0) {
            return {
                success: false,
                deletedTaskIds,
                errors: missingTaskIds.map(id => ({ id, error: `Task "${id}" no longer exists.` })),
            };
        }
        return { success: true, deletedTaskIds };
    }

    /**
     * Expands a template into a task and its whole subtree, in template order.
     *
     * @returns The created tasks, root first, or `null` when the template no longer exists.
     */
    public static createTasksFromTemplate(params: IMemoryTaskTemplateExpansionParams): IRawRecord[] | null {
        const { templateId, parentRecord, nextSibling, templateDataProvider, records, metadata, nativeColumns, columns, onGetNewTaskDefaults } = params;
        const template = templateDataProvider.getRecordsMap()[templateId];
        if (!template) {
            return null;
        }
        const buildParams = { records, metadata, nativeColumns, columns, onGetNewTaskDefaults };
        const rootTask = this._buildTask({
            ...buildParams,
            parentTaskId: parentRecord?.getRecordId() ?? null,
            stackRank: StackRank.between(undefined, this._getStackRank(nextSibling, nativeColumns)),
            parentReference: this._getParentReference(parentRecord),
            overrides: this._getTaskFieldsFromTemplate(template, templateDataProvider, columns, nativeColumns),
        });
        const created: IRawRecord[] = [rootTask];

        const createChildren = (nodes: IMemoryTaskTemplateNode[], parent: IRawRecord) => {
            //the descendants are ours to rank: they have no siblings in the store yet, so each one ranks
            //after the one built before it, which preserves the order the template describes
            let previousStackRank: string | undefined;
            for (const node of nodes) {
                const child = this._buildTask({
                    ...buildParams,
                    parentTaskId: parent[metadata.PrimaryIdAttribute!] as string,
                    stackRank: StackRank.between(previousStackRank, undefined),
                    //the parent was built by this very expansion, so the grid has no record instance for
                    //it yet - its reference comes from what we just built
                    parentReference: this._getNewTaskReference(parent, metadata, nativeColumns),
                    overrides: node.values,
                });
                previousStackRank = child[nativeColumns.stackRank] as string;
                created.push(child);
                if (node.children?.length) {
                    createChildren(node.children, child);
                }
            }
        };
        createChildren(templateDataProvider.getTemplateChildren(templateId), rootTask);

        //returned, not stored: the provider adds the whole subtree to its dataset
        return created;
    }

    /**
     * What opening records does without a consumer implementation: nothing. In-memory data has no forms
     * to navigate to, so the grid is left untouched.
     */
    public static openDatasetItems(_params: IMemoryTaskOpenParams): IOpenDatasetItemsResult | null {
        return null;
    }

    /**
     * Reorders or reparents a task by rewriting its parent lookup and stack rank.
     *
     * The provider already resolved where it lands, and refused the impossible cases, so this is the
     * write and nothing else.
     *
     * @returns The single changed record.
     */
    public static moveTask(params: IMemoryTaskMoveParams): IRawRecord[] {
        const { movingRecord, parentRecord, previousSibling, nextSibling, nativeColumns } = params;
        //the object the provider holds, not a copy: this is what the move rewrites
        const movingTask = movingRecord.getRawData();
        movingTask[nativeColumns.parentId] = this._getParentReference(parentRecord);
        movingTask[nativeColumns.stackRank] = StackRank.between(
            this._getStackRank(previousSibling, nativeColumns),
            this._getStackRank(nextSibling, nativeColumns),
        );
        return [movingTask];
    }

    /** Writes an edited record's dirty fields onto the stored task. */
    public static saveRecord(params: IMemoryTaskSaveParams): IRecordSaveOperationResult {
        const { record, onGetRecord } = params;
        const recordId = record.getRecordId();
        const stored = onGetRecord(recordId);
        if (!stored) {
            return { recordId, success: false, fields: [], errors: [{ message: `Task "${recordId}" no longer exists.` }] };
        }
        //getRawData() is the object in the consumer's array, so writing through it is the persistence
        const rawRecord = stored.getRawData();
        const fields: string[] = [];
        for (const field of record.getFields().filter(field => field.isDirty())) {
            const columnName = field.getColumn().name;
            rawRecord[columnName] = field.getValue();
            fields.push(columnName);
        }
        return { recordId, success: true, fields };
    }

    // ── Parent lookup ────────────────────────────────────────────────────────

    /**
     * The lookup value a task record stores for its parent: an entity-reference array under the plain
     * column name, taken from the parent's own `getNamedReference()`.
     *
     * The display name is a snapshot — renaming a parent does not rewrite the references its children hold.
     */
    private static _getParentReference(parent: IRecord | undefined): ComponentFramework.EntityReference[] | null {
        return parent ? [parent.getNamedReference()] : null;
    }

    /**
     * The same reference for a task this operation has only just created: the grid has no record
     * instance for it yet, so it is read off what we wrote.
     */
    private static _getNewTaskReference(task: IRawRecord, metadata: IMemoryProviderEntityMetadata, nativeColumns: INativeColumns): ComponentFramework.EntityReference[] {
        return [{
            id: { guid: task[metadata.PrimaryIdAttribute!] as string },
            name: task[nativeColumns.subject] as string,
            //an empty string beats `undefined` when `LogicalName` was not supplied
            etn: metadata.LogicalName ?? '',
        }];
    }

    /** A sibling's rank, read off the record the provider resolved. */
    private static _getStackRank(sibling: IRecord | undefined, nativeColumns: INativeColumns): string | undefined {
        return sibling?.getValue(nativeColumns.stackRank) as string | undefined;
    }

    // ── Task construction ────────────────────────────────────────────────────

    /**
     * Builds a new task record: every known column starts as `null`, the caller's defaults are
     * applied on top, and the primary id, parent lookup and stack rank are computed last so they can
     * never be overridden.
     */
    private static _buildTask(params: {
        metadata: IMemoryProviderEntityMetadata;
        nativeColumns: INativeColumns;
        columns: IColumn[];
        parentTaskId: string | null;
        parentReference: ComponentFramework.EntityReference[] | null;
        /** Where it sorts. Resolved by the provider for a created task, by the caller for a template's descendants. */
        stackRank: string;
        overrides?: Partial<IRawRecord>;
        onGetNewTaskDefaults?: (parentTaskId?: string) => Partial<IRawRecord>;
    }): IRawRecord {
        const { metadata, nativeColumns, columns, parentTaskId, parentReference, overrides, onGetNewTaskDefaults } = params;
        const { parentId, stackRank, stateCode } = nativeColumns;
        const task: IRawRecord = {};
        for (const column of columns) {
            task[column.name] = null;
        }
        Object.assign(task, onGetNewTaskDefaults?.(parentTaskId ?? undefined), overrides);
        task[metadata.PrimaryIdAttribute!] = crypto.randomUUID();
        task[parentId] = parentReference;
        task[stackRank] = params.stackRank;
        task[stateCode] ??= 0;
        return task;
    }

    /** Maps a template record onto the task fields the two entities share. */
    private static _getTaskFieldsFromTemplate(template: IRecord, templateDataProvider: MemoryTemplateDataProvider, columns: IColumn[], nativeColumns: INativeColumns): Partial<IRawRecord> {
        const metadata = templateDataProvider.getMetadata();
        const rawTemplate = template.getRawData();
        const fields: Partial<IRawRecord> = {};
        for (const column of columns) {
            if (column.name !== metadata?.PrimaryIdAttribute && rawTemplate[column.name] !== undefined) {
                fields[column.name] = rawTemplate[column.name];
            }
        }
        if (metadata?.PrimaryNameAttribute) {
            fields[nativeColumns.subject] = template.getNamedReference().name ?? null;
        }
        return fields;
    }

}
