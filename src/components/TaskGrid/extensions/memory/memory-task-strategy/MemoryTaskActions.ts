import {
    IAvailableColumnOptions,
    IAvailableRelatedColumn,
    IColumn,
    IMemoryProviderEntityMetadata,
    IRawRecord,
    IRecord,
    IRecordSaveOperationResult,
} from "@talxis/client-libraries";
import { IDeleteTasksResult, IOpenDatasetItemsResult, ISavedQueryDataProvider } from "@components/TaskGrid/providers";
import { IRecordTree } from "@components/TaskGrid/providers/task/record-tree";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { LexoRank } from "lexorank";
import { IMemoryTaskTemplateNode } from "../interfaces";
import { MemoryTemplateDataProvider } from "../MemoryTemplateDataProvider";

/** Where a new record should sit among its siblings. */
export type MemoryTaskPlacement = 'first' | 'last';

/** Parent id (or `null` for top level) to the stored children under it. */
export type MemoryTaskChildrenByParent = Map<string | null, IRawRecord[]>;

/** What every action that resolves a task by id needs. */
interface IMemoryTaskLookup {
    /**
     * Resolves the grid's record instance for a task — `provider.getRecordsMap()[taskId]`, which is
     * keyed over every loaded record rather than the filtered view.
     *
     * The instance is what the actions want: `getNamedReference()` is the lookup value a child stores
     * for it, `getValue()` returns the sanitized field value, and `getRawData()` hands back the very
     * object in the consumer's array — so a write needs no second lookup.
     */
    onGetRecord: (taskId: string) => IRecord | undefined;
}

/** The store an action writes into, and the names it needs to read a task apart. */
interface IMemoryTaskStore {
    /** The task records. **Written into** by the actions that create, delete or move. */
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

/** What {@link MemoryTaskActions.createTask} reads and writes. */
export interface IMemoryTaskCreateParams extends IMemoryTaskStore, IMemoryTaskLookup {
    /** The parent to create under, or `undefined` for a top-level task. */
    parentTaskId?: string;
    /** The active view's columns — every one of them starts out `null` on the new record. */
    columns: IColumn[];
    /** (Optional) The consumer's field defaults for a new task. */
    onGetNewTaskDefaults?: (parentTaskId?: string) => Partial<IRawRecord>;
}

/** What {@link MemoryTaskActions.deleteTasks} reads and writes. */
export interface IMemoryTaskDeleteParams extends IMemoryTaskStore, IMemoryTaskLookup {
    /** The tasks the grid asked to delete. Descendants are resolved from the store. */
    taskIds: string[];
}

/** What {@link MemoryTaskActions.createTasksFromTemplate} reads and writes. */
export interface IMemoryTaskTemplateExpansionParams extends IMemoryTaskStore, IMemoryTaskLookup {
    /** The template to expand. */
    templateId: string;
    /** The parent to create the template's root task under, or `undefined` for top level. */
    parentTaskId?: string;
    /** The provider holding the template and its child hierarchy. */
    templateDataProvider: MemoryTemplateDataProvider;
    /** The active view's columns — the fields a template can carry over. */
    columns: IColumn[];
    /** (Optional) The consumer's field defaults, applied under the template's own values. */
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
export interface IMemoryTaskMoveParams extends IMemoryTaskStore, IMemoryTaskLookup {
    /** The task being dragged. */
    movingTaskId: string;
    /** The task it was dropped on. */
    targetTaskId: string;
    /** Where it landed relative to the target. */
    position: 'above' | 'below' | 'child';
    /** The grid's hierarchy — the source of both the cycle guard and the visible sibling order. */
    recordTree: IRecordTree;
}

/** What {@link MemoryTaskActions.saveRecord} reads and writes. */
export interface IMemoryTaskSaveParams extends IMemoryTaskLookup {
    /** The edited record. Its dirty fields are written onto the stored task. */
    record: IRecord;
}

/**
 * The behaviour behind `MemoryTaskStrategy`, as actions over the records and column names you pass in —
 * no state of its own, nothing resolved from a descriptor.
 *
 * The strategy is the thin part: it holds the records, the provider and the consumer's overrides, and
 * every one of its hooks is "call the override if there is one, otherwise call the action here". So each
 * override receives exactly the action's parameters and can forward them straight back to it:
 *
 * ```ts
 * onDeleteTasks: async params => {
 *     await audit(params.taskIds);
 *     return MemoryTaskActions.deleteTasks(params);
 * },
 * ```
 *
 * Call these directly when you write a task strategy of your own and want the shipped semantics for
 * part of it.
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
        //loose comparison on purpose: Field._sanitizeValue stringifies option-set values, so a
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
        //view", and the Edit columns panel drops a column it is handed hidden - so passing the query
        //definitions through unchanged is what made adding one appear to do nothing
        return [...columns.values()].map(column => ({ ...column, isHidden: false }));
    }

    /**
     * The related-column catalogue, which in-memory data has no way to discover: there is no
     * relationship metadata to walk, so nothing is offered.
     */
    public static getAvailableRelatedColumns(_params: IMemoryTaskAvailableRelatedColumnsParams): IAvailableRelatedColumn[] {
        return [];
    }

    /** Creates one task and appends it to the store. */
    public static createTask(params: IMemoryTaskCreateParams): IRawRecord {
        const parent = params.parentTaskId ? params.onGetRecord(params.parentTaskId) : undefined;
        return this._addTask(params.records, this._buildTask({
            ...params,
            placement: 'first',
            parentReference: this._getParentReference(parent),
        }));
    }

    /**
     * Deletes tasks and everything beneath them, rewriting the store in place.
     *
     * Ids that no longer exist are reported as errors, and whatever did resolve is still deleted.
     */
    public static deleteTasks(params: IMemoryTaskDeleteParams): IDeleteTasksResult {
        const { taskIds, records, metadata, nativeColumns, onGetRecord } = params;
        const primaryId = metadata.PrimaryIdAttribute!;
        //descendants come from the store, not the tree: the tree's children are filtered by the active
        //view, so a hidden child would survive its deleted parent as an orphan
        const childrenByParent = this._getChildrenByParent(records, nativeColumns);
        const toDelete = new Set<string>();
        const missingTaskIds: string[] = [];
        for (const id of taskIds) {
            if (!onGetRecord(id)) {
                missingTaskIds.push(id);
                continue;
            }
            this._collectSubtree(id, primaryId, childrenByParent, toDelete);
        }
        //rewritten in one pass, in place: the array identity is what the consumer holds on to
        const remaining = records.filter(record => !toDelete.has(record[primaryId] as string));
        const deletedTaskIds = [...toDelete];
        if (remaining.length !== records.length) {
            records.length = 0;
            for (const record of remaining) {
                records.push(record);
            }
        }
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
        const { templateId, parentTaskId, templateDataProvider, records, metadata, nativeColumns, columns, onGetRecord, onGetNewTaskDefaults } = params;
        const primaryId = metadata.PrimaryIdAttribute!;
        const template = templateDataProvider.getRecordsMap()[templateId];
        if (!template) {
            return null;
        }
        //built once for the whole expansion, and kept up to date as tasks are added: ranking each new
        //task by scanning the store would be a full pass per node
        const childrenByParent = this._getChildrenByParent(records, nativeColumns);
        const buildParams = { records, metadata, nativeColumns, columns, onGetNewTaskDefaults, childrenByParent };
        const rootTask = this._addTask(records, this._buildTask({
            ...buildParams,
            parentTaskId,
            parentReference: this._getParentReference(parentTaskId ? onGetRecord(parentTaskId) : undefined),
            overrides: this._getTaskFieldsFromTemplate(template, templateDataProvider, columns, nativeColumns),
            placement: 'first',
        }), { nativeColumns, childrenByParent });
        const created: IRawRecord[] = [rootTask];

        const createChildren = (nodes: IMemoryTaskTemplateNode[], parent: IRawRecord) => {
            for (const node of nodes) {
                //appended so each child ranks after the sibling created before it, preserving template order
                const child = this._addTask(records, this._buildTask({
                    ...buildParams,
                    parentTaskId: parent[primaryId] as string,
                    //the parent was created by this very expansion, so the grid has no record instance
                    //for it yet - its reference is built from what we just wrote
                    parentReference: this._getNewTaskReference(parent, metadata, nativeColumns),
                    overrides: node.values,
                    placement: 'last',
                }), { nativeColumns, childrenByParent });
                created.push(child);
                if (node.children?.length) {
                    createChildren(node.children, child);
                }
            }
        };
        createChildren(templateDataProvider.getTemplateChildren(templateId), rootTask);

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
     * @returns The single changed record, or `null` when the move is impossible — an unknown task, or
     * one that would end up inside its own subtree.
     */
    public static moveTask(params: IMemoryTaskMoveParams): IRawRecord[] | null {
        const { movingTaskId, targetTaskId, position, records, metadata, nativeColumns, recordTree, onGetRecord } = params;
        const { parentId, stackRank } = nativeColumns;
        const moving = onGetRecord(movingTaskId);
        const target = onGetRecord(targetTaskId);
        if (!moving || !target) {
            return null;
        }
        //the object in the consumer's array, not a copy: this is what the move rewrites
        const movingTask = moving.getRawData();
        //a task cannot become its own descendant: the hierarchy would cycle, and the record tree drops
        //every record in a cycle - the rows would simply vanish from the grid. `pathIds` runs from the
        //root down to the target itself, so this covers dropping a task onto itself as well
        if (recordTree.getNode(targetTaskId)?.pathIds.includes(movingTaskId)) {
            return null;
        }

        if (position === 'child') {
            //ranked before reparenting so the moving task is not weighed against itself
            const rank = this._getRankAmongSiblings({ parentTaskId: targetTaskId, placement: 'first', excludeTaskId: movingTaskId, records, metadata, nativeColumns });
            movingTask[parentId] = this._getParentReference(target);
            movingTask[stackRank] = rank;
            return [movingTask];
        }

        const targetParentId = this._getParentRecordId(target, nativeColumns);
        //siblings come from the tree so that "above"/"below" follow the order the user can see
        const siblings = (recordTree.getNode(targetParentId)?.directChildren ?? [])
            .filter(record => record.getRecordId() !== movingTaskId);
        const targetIndex = siblings.findIndex(record => record.getRecordId() === targetTaskId);
        //a target the tree cannot place (hidden by the active view) simply has no neighbour, which
        //ranks the moving task just beyond it rather than next to an unrelated sibling
        const neighbour = targetIndex < 0
            ? undefined
            : siblings[position === 'above' ? targetIndex - 1 : targetIndex + 1];
        const targetRank = target.getValue(stackRank) as string;
        const neighbourRank = neighbour?.getValue(stackRank) as string | undefined;

        movingTask[parentId] = this._getParentReference(targetParentId ? onGetRecord(targetParentId) : undefined);
        movingTask[stackRank] = position === 'above'
            ? this._getRankBetween(neighbourRank, targetRank)
            : this._getRankBetween(targetRank, neighbourRank);
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
     * column name.
     *
     * It is the parent's own {@link IRecord.getNamedReference}, so the id, the entity name and the
     * display name all come from the grid rather than being assembled here. The name matters once the
     * parent column is shown — without one the cell reads "(No Name)" — and it is a snapshot: renaming
     * a parent does not rewrite the references its children hold.
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

    /** The parent id held by a record the grid knows about. */
    private static _getParentRecordId(record: IRecord, nativeColumns: INativeColumns): string | null {
        const parentReference = record.getValue(nativeColumns.parentId) as ComponentFramework.EntityReference[] | null;
        return parentReference?.[0]?.id?.guid ?? null;
    }

    /** The parent id held by a raw record — used when walking the store, which has no instances. */
    private static _getParentTaskId(task: IRawRecord, nativeColumns: INativeColumns): string | null {
        const parentReference = task[nativeColumns.parentId] as ComponentFramework.EntityReference[] | null;
        return parentReference?.[0]?.id?.guid ?? null;
    }

    // ── Task construction ────────────────────────────────────────────────────

    /**
     * Builds a new task record: every known column starts as `null`, the caller's defaults are
     * applied on top, and the primary id, parent lookup and stack rank are computed last so they can
     * never be overridden.
     */
    private static _buildTask(params: {
        records: IRawRecord[];
        metadata: IMemoryProviderEntityMetadata;
        nativeColumns: INativeColumns;
        columns: IColumn[];
        parentTaskId?: string;
        parentReference: ComponentFramework.EntityReference[] | null;
        overrides?: Partial<IRawRecord>;
        placement: MemoryTaskPlacement;
        onGetNewTaskDefaults?: (parentTaskId?: string) => Partial<IRawRecord>;
        childrenByParent?: MemoryTaskChildrenByParent;
    }): IRawRecord {
        const { records, metadata, nativeColumns, columns, parentTaskId, parentReference, overrides, placement, onGetNewTaskDefaults, childrenByParent } = params;
        const { parentId, stackRank, stateCode } = nativeColumns;
        const task: IRawRecord = {};
        for (const column of columns) {
            task[column.name] = null;
        }
        Object.assign(task, onGetNewTaskDefaults?.(parentTaskId), overrides);
        task[metadata.PrimaryIdAttribute!] = crypto.randomUUID();
        task[parentId] = parentReference;
        task[stackRank] = this._getRankAmongSiblings({ parentTaskId: parentTaskId ?? null, placement, records, metadata, nativeColumns, childrenByParent });
        task[stateCode] ??= 0;
        return task;
    }

    /**
     * Appends a task to the caller's array — the write that makes it outlive the strategy.
     *
     * @param index — kept up to date alongside the store when one was built for the operation, so the
     * next task ranks against the siblings this one just joined.
     */
    private static _addTask(records: IRawRecord[], task: IRawRecord, index?: { nativeColumns: INativeColumns; childrenByParent: MemoryTaskChildrenByParent }): IRawRecord {
        records.push(task);
        if (index) {
            const parentTaskId = this._getParentTaskId(task, index.nativeColumns);
            const siblings = index.childrenByParent.get(parentTaskId);
            if (siblings) {
                siblings.push(task);
            }
            else {
                index.childrenByParent.set(parentTaskId, [task]);
            }
        }
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

    /**
     * Parent id (or `null` for top level) to the stored children, built in one pass over the store.
     *
     * The record tree cannot serve this: its `directChildren` and `allChildren` are pruned to branches
     * that match the active filter and quick find, so a hidden child would survive its deleted parent.
     * `pathIds` is safe by contrast — it is walked over the unfiltered record map.
     */
    private static _getChildrenByParent(records: IRawRecord[], nativeColumns: INativeColumns): MemoryTaskChildrenByParent {
        const childrenByParent: MemoryTaskChildrenByParent = new Map();
        for (const record of records) {
            const parentTaskId = this._getParentTaskId(record, nativeColumns);
            const siblings = childrenByParent.get(parentTaskId);
            if (siblings) {
                siblings.push(record);
            }
            else {
                childrenByParent.set(parentTaskId, [record]);
            }
        }
        return childrenByParent;
    }

    private static _collectSubtree(taskId: string, primaryId: string, childrenByParent: MemoryTaskChildrenByParent, result: Set<string>): void {
        if (result.has(taskId)) {
            return;
        }
        result.add(taskId);
        for (const child of childrenByParent.get(taskId) ?? []) {
            this._collectSubtree(child[primaryId] as string, primaryId, childrenByParent, result);
        }
    }

    // ── Stack rank ───────────────────────────────────────────────────────────

    /**
     * Returns a rank placing a record at the start or end of a parent's children.
     *
     * Siblings are read from the full record array rather than the tree so that records hidden by the
     * active view still participate — otherwise a new task could collide with a filtered-out one.
     */
    private static _getRankAmongSiblings(params: {
        parentTaskId: string | null;
        placement: MemoryTaskPlacement;
        records: IRawRecord[];
        metadata: IMemoryProviderEntityMetadata;
        nativeColumns: INativeColumns;
        /** A task to ignore, so a record being moved is not ranked against itself. */
        excludeTaskId?: string;
        childrenByParent?: MemoryTaskChildrenByParent;
    }): string {
        const { parentTaskId, placement, records, metadata, nativeColumns, excludeTaskId, childrenByParent } = params;
        const { stackRank } = nativeColumns;
        const primaryId = metadata.PrimaryIdAttribute!;
        const siblings = childrenByParent
            ? childrenByParent.get(parentTaskId) ?? []
            //no index handed in: one pass, rather than a filter that re-reads every parent lookup twice
            : records.filter(record => this._getParentTaskId(record, nativeColumns) === parentTaskId);
        //a single parse per sibling, and the boundary is kept parsed instead of being re-parsed each time
        let boundary: LexoRank | undefined;
        for (const sibling of siblings) {
            if (sibling[primaryId] === excludeTaskId) {
                continue;
            }
            const rank = sibling[stackRank] as string;
            if (!rank) {
                continue;
            }
            const parsed = LexoRank.parse(rank);
            if (!boundary) {
                boundary = parsed;
                continue;
            }
            const isBefore = parsed.compareTo(boundary) < 0;
            if (isBefore === (placement === 'first')) {
                boundary = parsed;
            }
        }
        if (!boundary) {
            return LexoRank.middle().format();
        }
        return (placement === 'first' ? boundary.genPrev() : boundary.genNext()).format();
    }

    /** Returns a rank strictly between two neighbours, extending past the end when one is missing. */
    private static _getRankBetween(previousRank?: string, nextRank?: string): string {
        if (previousRank && nextRank) {
            return LexoRank.parse(previousRank).between(LexoRank.parse(nextRank)).format();
        }
        if (previousRank) {
            return LexoRank.parse(previousRank).genNext().format();
        }
        if (nextRank) {
            return LexoRank.parse(nextRank).genPrev().format();
        }
        return LexoRank.middle().format();
    }
}
