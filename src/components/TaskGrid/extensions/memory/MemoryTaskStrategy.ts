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
    ITaskDataProvider,
    ITaskDataProviderStrategy,
} from "@components/TaskGrid/providers";
import { IRecordTree } from "@components/TaskGrid/providers/task/record-tree";
import { INativeColumns, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { LexoRank } from "lexorank";
import { IMemoryTaskTemplateNode } from "./interfaces";
import { MemoryTemplateDataProvider } from "./MemoryTemplateDataProvider";

/** Where a new record should sit among its siblings. */
type Placement = 'first' | 'last';

/**
 * The task entity's records and metadata, plus the behaviour resolved by
 * {@link IMemoryTaskStrategyParams.onInitialize}.
 *
 * Columns are deliberately absent: they belong to the grid's active view, so the strategy reads them
 * back from the provider rather than being told what they are.
 */
export interface IMemoryTaskStrategyDependencies {
    /**
     * The task records. **This array is written into.** Creating, deleting, editing and moving tasks
     * mutates it, which is how the data outlives this strategy — the grid rebuilds the strategy on
     * every remount and resolves the callback again to get the same array back.
     */
    records: IRawRecord[];
    /** Entity metadata. `PrimaryIdAttribute` is required; `LogicalName` is recommended. */
    metadata: IMemoryProviderEntityMetadata;
    /**
     * Field values applied to newly created tasks. Merged over a record in which every known column
     * is `null`; the primary id, parent lookup and stack rank are always computed by the strategy.
     */
    onGetNewTaskDefaults?: (parentTaskId?: string) => Partial<IRawRecord>;
    /**
     * Determines whether a task counts as active. Defaults to `record[stateCode] === 0`, using the
     * state-code column from the descriptor's field mapping.
     */
    onIsRecordActive?: (record: IRawRecord) => boolean;
    /**
     * Invoked when the user opens task(s) or a related record — the memory equivalent of navigating
     * to a form. Defaults to a no-op, which leaves the grid untouched.
     */
    onOpenDatasetItems?: (
        entityReferences: ComponentFramework.EntityReference[],
        isTaskEntity: boolean,
        context: { isTaskEditingEnabled: boolean },
    ) => Promise<IOpenDatasetItemsResult | null>;
}

/** Constructor parameters for {@link MemoryTaskStrategy}. */
export interface IMemoryTaskStrategyParams {
    /**
     * Resolves the seed data and configuration. Awaited from inside the strategy's own
     * `onInitialize` hook, which the TaskGrid already treats as asynchronous — so the grid's
     * loading state covers the work and nothing has to be available at construction time.
     */
    onInitialize: () => Promise<IMemoryTaskStrategyDependencies>;
}

/**
 * {@link ITaskDataProviderStrategy} implementation backed entirely by in-memory records.
 *
 * Supports the full task surface — create, delete (cascading to descendants), drag-and-drop
 * reordering via LexoRank, templates, and inline editing — without any server or Dataverse
 * dependency. Intended for local development, tests, Storybook and demos.
 *
 * The strategy keeps no data of its own. It reads and writes the arrays its `onInitialize` callback
 * returns, the way a Dataverse strategy reads and writes the server — which is what lets the grid
 * recreate it on every remount without losing anything the user did.
 *
 * Normally created by {@link MemoryTaskGridDescriptor}; construct it directly when you supply your
 * own descriptor, or subclass it to override a single hook.
 */
export class MemoryTaskStrategy implements ITaskDataProviderStrategy {
    private _onInitialize: () => Promise<IMemoryTaskStrategyDependencies>;
    private _isTaskEditingEnabled: boolean;
    private _savedQueryDataProvider: ISavedQueryDataProvider;
    /**
     * The provider that owns the template source. Narrowed to the memory implementation, the way the
     * Dataverse strategy narrows its custom-columns strategy — expanding a template needs the child
     * hierarchy, which only the memory provider knows about.
     */
    private _templateDataProvider?: MemoryTemplateDataProvider;
    private _provider!: ITaskDataProvider;
    private _dependencies!: IMemoryTaskStrategyDependencies;

    /** @param params — see {@link IMemoryTaskStrategyParams}. */
    constructor(params: IMemoryTaskStrategyParams, deps: ITaskStrategyDeps) {
        this._onInitialize = params.onInitialize;
        this._isTaskEditingEnabled = deps.enableTaskEditing;
        this._savedQueryDataProvider = deps.savedQueryDataProvider;
        this._templateDataProvider = deps.templateDataProvider as MemoryTemplateDataProvider | undefined;
    }

    // ── ITaskDataProviderStrategy ────────────────────────────────────────────

    public async onInitialize(provider: ITaskDataProvider) {
        this._provider = provider;
        this._dependencies = await this._onInitialize();
        return {
            columns: provider.getColumns(),
            //a copy of the array holding the same records: the provider replaces its own array on
            //delete, so it must not be handed the one we write to
            rawData: [...this._records],
            metadata: this._dependencies.metadata,
        };
    }

    public async onGetRawRecords(ids: string[]): Promise<IRawRecord[]> {
        return ids.flatMap(id => {
            const record = this._getTask(id);
            return record ? [record] : [];
        });
    }

    public async onGetAvailableColumns(_options?: IAvailableColumnOptions): Promise<IColumn[]> {
        const queries = [
            ...this._savedQueryDataProvider.getSystemQueries(),
            ...this._savedQueryDataProvider.getUserQueries(),
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

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        return [];
    }

    public async onCreateTask(parentTaskId?: string): Promise<IRawRecord | null> {
        return this._addTask(this._buildTask(parentTaskId));
    }

    public async onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult> {
        const toDelete = new Set<string>();
        for (const id of taskIds) {
            this._collectSubtree(id, toDelete);
        }
        const deletedTaskIds: string[] = [];
        for (const id of toDelete) {
            const index = this._records.findIndex(record => record[this._primaryId] === id);
            if (index >= 0) {
                this._records.splice(index, 1);
                deletedTaskIds.push(id);
            }
        }
        return { success: true, deletedTaskIds };
    }

    public async onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null> {
        const templateDataProvider = this._templateDataProvider;
        if (!templateDataProvider) {
            return null;
        }
        const template = templateDataProvider.getRecordsMap()[templateId];
        if (!template) {
            return null;
        }
        const rootTask = this._addTask(this._buildTask(parentTaskId, this._getTaskFieldsFromTemplate(template)));
        const created: IRawRecord[] = [rootTask];

        const createChildren = (nodes: IMemoryTaskTemplateNode[], parentId: string) => {
            for (const node of nodes) {
                //appended so each child ranks after the sibling created before it, preserving template order
                const child = this._addTask(this._buildTask(parentId, node.values, 'last'));
                created.push(child);
                if (node.children?.length) {
                    createChildren(node.children, child[this._primaryId] as string);
                }
            }
        };
        createChildren(templateDataProvider.getTemplateChildren(templateId), rootTask[this._primaryId] as string);

        return created;
    }

    public async onOpenDatasetItems(
        entityReferences: ComponentFramework.EntityReference[],
        isTaskEntity: boolean,
    ): Promise<IOpenDatasetItemsResult | null> {
        return await this._dependencies.onOpenDatasetItems?.(entityReferences, isTaskEntity, {
            isTaskEditingEnabled: this._isTaskEditingEnabled,
        }) ?? null;
    }

    public async onMoveTask(
        movingTaskId: string,
        targetTaskId: string,
        position: 'above' | 'below' | 'child',
    ): Promise<IRawRecord[] | null> {
        const { parentId, stackRank } = this._nativeColumns;
        const moving = this._getTask(movingTaskId);
        const target = this._getTask(targetTaskId);
        if (!moving || !target) {
            return null;
        }

        if (position === 'child') {
            //ranked before reparenting so the moving task is not weighed against itself
            const rank = this._getRankAmongSiblings(targetTaskId, 'first', movingTaskId);
            moving[parentId] = this._getParentReference(targetTaskId);
            moving[stackRank] = rank;
            return [moving];
        }

        const targetParentId = this._getParentTaskId(target);
        //siblings come from the tree so that "above"/"below" follow the order the user can see
        const siblings = this._getVisibleChildren(targetParentId)
            .filter(record => record[this._primaryId] !== movingTaskId);
        const targetIndex = siblings.indexOf(target);
        //a target the tree cannot place (hidden by the active view) simply has no neighbour, which
        //ranks the moving task just beyond it rather than next to an unrelated sibling
        const neighbour = targetIndex < 0
            ? undefined
            : siblings[position === 'above' ? targetIndex - 1 : targetIndex + 1];
        const targetRank = target[stackRank] as string;
        const neighbourRank = neighbour?.[stackRank] as string | undefined;

        moving[parentId] = this._getParentReference(targetParentId ?? undefined);
        moving[stackRank] = position === 'above'
            ? this._getRankBetween(neighbourRank, targetRank)
            : this._getRankBetween(targetRank, neighbourRank);
        return [moving];
    }

    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const recordId = record.getRecordId();
        const existing = this._getTask(recordId);
        if (!existing) {
            return { recordId, success: false, fields: [], errors: [{ message: `Task "${recordId}" no longer exists.` }] };
        }
        const fields: string[] = [];
        for (const field of record.getFields().filter(field => field.isDirty())) {
            const columnName = field.getColumn().name;
            existing[columnName] = field.getValue();
            fields.push(columnName);
        }
        return { recordId, success: true, fields };
    }

    public onIsRecordActive(recordId: string): boolean {
        const record = this._getTask(recordId);
        if (!record) {
            return true;
        }
        return this._dependencies.onIsRecordActive?.(record) ?? record[this._nativeColumns.stateCode] == 0;
    }

    // ── Derived state ────────────────────────────────────────────────────────

    /** The caller's task array — every read and write goes straight to it. */
    private get _records(): IRawRecord[] {
        return this._dependencies.records;
    }

    private get _primaryId(): string {
        return this._dependencies.metadata.PrimaryIdAttribute!;
    }

    /** The physical field names the descriptor mapped, owned by the provider. */
    private get _nativeColumns(): INativeColumns {
        return this._provider.getNativeColumns();
    }

    private get _taskTree(): IRecordTree {
        return this._provider.getRecordTree();
    }

    // ── Parent lookup ────────────────────────────────────────────────────────

    /**
     * The lookup value a task record stores for its parent: an entity-reference array under the plain
     * column name. A name is not needed — the tree builds its path strings from the ancestor records
     * themselves.
     */
    private _getParentReference(parentTaskId?: string): ComponentFramework.EntityReference[] | null {
        if (!parentTaskId) {
            return null;
        }
        return [{
            id: { guid: parentTaskId },
            etn: this._dependencies.metadata.LogicalName,
        } as ComponentFramework.EntityReference];
    }

    private _getParentTaskId(task: IRawRecord): string | null {
        const parentReference = task[this._nativeColumns.parentId] as ComponentFramework.EntityReference[] | null;
        return parentReference?.[0]?.id?.guid ?? null;
    }

    // ── Task construction ────────────────────────────────────────────────────

    /**
     * Builds a new task record: every known column starts as `null`, the caller's defaults are
     * applied on top, and the primary id, parent lookup and stack rank are computed last so they can
     * never be overridden.
     */
    private _buildTask(parentTaskId?: string, overrides?: Partial<IRawRecord>, placement: Placement = 'first'): IRawRecord {
        const { parentId, stackRank, stateCode } = this._nativeColumns;
        const task: IRawRecord = {};
        for (const column of this._provider.getColumns()) {
            task[column.name] = null;
        }
        Object.assign(task, this._dependencies.onGetNewTaskDefaults?.(parentTaskId), overrides);
        task[this._primaryId] = crypto.randomUUID();
        task[parentId] = this._getParentReference(parentTaskId);
        task[stackRank] = this._getRankAmongSiblings(parentTaskId ?? null, placement);
        task[stateCode] ??= 0;
        return task;
    }

    /** Appends a task to the caller's array — the write that makes it outlive this strategy. */
    private _addTask(task: IRawRecord): IRawRecord {
        this._records.push(task);
        return task;
    }

    /** Maps a template record onto the task fields the two entities share. */
    private _getTaskFieldsFromTemplate(template: IRecord): Partial<IRawRecord> {
        const metadata = this._templateDataProvider?.getMetadata();
        const rawTemplate = template.getRawData();
        const fields: Partial<IRawRecord> = {};
        for (const column of this._provider.getColumns()) {
            if (column.name !== metadata?.PrimaryIdAttribute && rawTemplate[column.name] !== undefined) {
                fields[column.name] = rawTemplate[column.name];
            }
        }
        if (metadata?.PrimaryNameAttribute) {
            fields[this._nativeColumns.subject] = template.getNamedReference().name ?? null;
        }
        return fields;
    }

    private _collectSubtree(taskId: string, result: Set<string>): void {
        result.add(taskId);
        for (const child of this._taskTree.getNode(taskId)?.directChildren ?? []) {
            this._collectSubtree(child.getRecordId(), result);
        }
    }

    /** Returns the stored records for a parent's children, in the order the grid displays them. */
    private _getVisibleChildren(parentTaskId: string | null): IRawRecord[] {
        return (this._taskTree.getNode(parentTaskId)?.directChildren ?? [])
            .map(child => this._getTask(child.getRecordId()))
            .filter((record): record is IRawRecord => !!record);
    }

    private _getTask(taskId: string): IRawRecord | undefined {
        return this._records.find(record => record[this._primaryId] === taskId);
    }

    // ── Stack rank ───────────────────────────────────────────────────────────

    /**
     * Returns a rank placing a record at the start or end of a parent's children.
     *
     * Siblings are read from the full record array rather than the tree so that records hidden by the
     * active view still participate — otherwise a new task could collide with a filtered-out one.
     *
     * @param excludeTaskId — a task to ignore, so a record being moved is not ranked against itself.
     */
    private _getRankAmongSiblings(parentTaskId: string | null, placement: Placement, excludeTaskId?: string): string {
        const stackRank = this._nativeColumns.stackRank;
        const ranks = this._records
            .filter(record => this._getParentTaskId(record) === parentTaskId
                && record[this._primaryId] !== excludeTaskId)
            .map(record => record[stackRank] as string)
            .filter(Boolean);
        if (ranks.length === 0) {
            return LexoRank.middle().format();
        }
        const boundary = ranks.reduce((result, rank) => {
            const isBefore = LexoRank.parse(rank).compareTo(LexoRank.parse(result)) < 0;
            return isBefore === (placement === 'first') ? rank : result;
        });
        const parsed = LexoRank.parse(boundary);
        return (placement === 'first' ? parsed.genPrev() : parsed.genNext()).format();
    }

    /** Returns a rank strictly between two neighbours, extending past the end when one is missing. */
    private _getRankBetween(previousRank?: string, nextRank?: string): string {
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
