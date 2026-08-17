import {
    IAvailableColumnOptions,
    IAvailableRelatedColumn,
    IColumn,
    IDataProvider,
    IRawRecord,
    IRecord,
    IRecordSaveOperationResult,
} from "@talxis/client-libraries";
import {
    IDeleteTasksResult,
    IOpenDatasetItemsResult,
    ITaskDataProvider,
    ITaskDataProviderStrategy,
} from "@components/TaskGrid/providers";
import { IRecordTree } from "@components/TaskGrid/providers/task/record-tree";
import { ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { LexoRank } from "lexorank";
import { IMemoryEntitySource, IMemoryTaskTemplateNode, IMemoryTemplateSource } from "./interfaces";

/** Where a new record should sit among its siblings. */
type Placement = 'first' | 'last';

/** Data and behaviour resolved by {@link IMemoryTaskStrategyParams.onInitialize}. */
export interface IMemoryTaskStrategyDependencies {
    /**
     * The task entity: records, column definitions and metadata.
     *
     * **`records` is written into.** Creating, deleting, editing and moving tasks mutates that array,
     * which is how the data outlives this strategy — the grid rebuilds the strategy on every remount
     * and resolves the callback again to get the same array back.
     */
    tasks: IMemoryEntitySource;
    /**
     * Task templates: the template entity plus the child hierarchy each template expands into.
     * Written into the same way when a template is created from a task. Omit to disable templates.
     */
    templates?: IMemoryTemplateSource;
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

/** The dependencies plus the physical field names, resolved in `onInitialize` and kept for the hooks. */
interface IResolvedDependencies {
    dependencies: IMemoryTaskStrategyDependencies;
    /** The caller's task array — every read and write goes straight to it. */
    records: IRawRecord[];
    columns: IColumn[];
    /** Primary key attribute of the task entity. */
    primaryId: string;
    /** Raw key holding the parent lookup's value. Dataverse shape: `_<lookup>_value`. */
    parentIdValue: string;
    stackRank: string;
    stateCode: string;
    subject: string;
    /** Non-hidden column names — what a user can see, edit, and capture into a template. */
    visibleColumns: string[];
    /** Columns `onRecordSave` may write. */
    editableColumns: string[];
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
    private _templateDataProvider?: IDataProvider;
    private _taskTree!: IRecordTree;
    /**
     * The resolved dependencies and the physical field names taken from the provider's mapping, kept
     * from `onInitialize`. References only — the arrays inside belong to the caller, and the strategy
     * writes straight into them rather than keeping data of its own.
     */
    private _dependencies!: IResolvedDependencies;

    /** @param params — see {@link IMemoryTaskStrategyParams}. */
    constructor(params: IMemoryTaskStrategyParams, deps: ITaskStrategyDeps) {
        this._onInitialize = params.onInitialize;
        this._templateDataProvider = deps.templateDataProvider;
        this._isTaskEditingEnabled = deps.enableTaskEditing;
    }

    // ── ITaskDataProviderStrategy ────────────────────────────────────────────

    public async onInitialize(provider: ITaskDataProvider) {
        this._taskTree = provider.getRecordTree();
        const dependencies = await this._onInitialize();
        const { tasks } = dependencies;
        const fieldMapping = provider.getNativeColumns();
        const visibleColumns = tasks.columns.filter(column => !column.isHidden).map(column => column.name);
        this._dependencies = {
            dependencies: dependencies,
            records: tasks.records,
            columns: tasks.columns,
            primaryId: tasks.metadata.PrimaryIdAttribute!,
            //dataverse exposes lookup values under this key, and the memory data mirrors that shape
            parentIdValue: `_${fieldMapping.parentId}_value`,
            stackRank: fieldMapping.stackRank,
            stateCode: fieldMapping.stateCode,
            subject: fieldMapping.subject,
            visibleColumns: visibleColumns,
            //plus state code, so toggling a task active/inactive keeps working
            editableColumns: [...visibleColumns, fieldMapping.stateCode],
        };
        return {
            columns: provider.getColumns(),
            //a copy of the array holding the same records: the provider replaces its own array on
            //delete, so it must not be handed the one we write to
            rawData: [...tasks.records],
            metadata: tasks.metadata,
        };
    }

    public async onGetRawRecords(ids: string[]): Promise<IRawRecord[]> {
        return ids.flatMap(id => {
            const record = this._getTask(id);
            return record ? [record] : [];
        });
    }

    public async onGetAvailableColumns(_options?: IAvailableColumnOptions): Promise<IColumn[]> {
        return this._dependencies.columns.filter(column => !column.isHidden);
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
        const { records, primaryId } = this._dependencies;
        const deletedTaskIds: string[] = [];
        for (const id of toDelete) {
            const index = records.findIndex(record => record[primaryId] === id);
            if (index >= 0) {
                records.splice(index, 1);
                deletedTaskIds.push(id);
            }
        }
        return { success: true, deletedTaskIds };
    }

    public async onCreateTemplateFromTask(taskId: string): Promise<IRawRecord | null> {
        const { dependencies, subject } = this._dependencies;
        const templates = dependencies.templates;
        const task = this._getTask(taskId);
        if (!task || !templates) {
            return null;
        }
        const { PrimaryIdAttribute, PrimaryNameAttribute } = templates.metadata;
        const templateId = crypto.randomUUID();
        const template: IRawRecord = { [PrimaryIdAttribute!]: templateId };
        //carry over every field the template entity and the task entity have in common
        for (const column of templates.columns) {
            if (column.name !== PrimaryIdAttribute) {
                template[column.name] = task[column.name] ?? null;
            }
        }
        if (PrimaryNameAttribute) {
            template[PrimaryNameAttribute] = task[subject] ?? null;
        }

        templates.records.push(template);
        const children = this._buildTemplateNodes(taskId);
        if (children.length > 0) {
            templates.children ??= {};
            templates.children[templateId] = children;
        }
        //already written - this only re-points an open picker at the updated list
        this._templateDataProvider?.setDataSource([...templates.records]);
        return template;
    }

    public async onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null> {
        const templates = this._dependencies.dependencies.templates;
        if (!templates) {
            return null;
        }
        const template = templates.records.find(record => record[templates.metadata.PrimaryIdAttribute!] === templateId);
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
                    createChildren(node.children, child[this._dependencies.primaryId] as string);
                }
            }
        };
        createChildren(templates.children?.[templateId] ?? [], rootTask[this._dependencies.primaryId] as string);

        return created;
    }

    public async onOpenDatasetItems(
        entityReferences: ComponentFramework.EntityReference[],
        isTaskEntity: boolean,
    ): Promise<IOpenDatasetItemsResult | null> {
        return await this._dependencies.dependencies.onOpenDatasetItems?.(entityReferences, isTaskEntity, {
            isTaskEditingEnabled: this._isTaskEditingEnabled,
        }) ?? null;
    }

    public async onMoveTask(
        movingTaskId: string,
        targetTaskId: string,
        position: 'above' | 'below' | 'child',
    ): Promise<IRawRecord[] | null> {
        const { parentIdValue, stackRank } = this._dependencies;
        const moving = this._getTask(movingTaskId);
        const target = this._getTask(targetTaskId);
        if (!moving || !target) {
            return null;
        }

        if (position === 'child') {
            //ranked before reparenting so the moving task is not weighed against itself
            const rank = this._getRankAmongSiblings(targetTaskId, 'first', movingTaskId);
            moving[parentIdValue] = targetTaskId;
            moving[stackRank] = rank;
            return [moving];
        }

        const targetParentId = (target[parentIdValue] as string) ?? null;
        //siblings come from the tree so that "above"/"below" follow the order the user can see
        const siblings = this._getVisibleChildren(targetParentId)
            .filter(record => record[this._dependencies.primaryId] !== movingTaskId);
        const targetIndex = siblings.indexOf(target);
        //a target the tree cannot place (hidden by the active view) simply has no neighbour, which
        //ranks the moving task just beyond it rather than next to an unrelated sibling
        const neighbour = targetIndex < 0
            ? undefined
            : siblings[position === 'above' ? targetIndex - 1 : targetIndex + 1];
        const targetRank = target[stackRank] as string;
        const neighbourRank = neighbour?.[stackRank] as string | undefined;

        moving[parentIdValue] = targetParentId;
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
        for (const columnName of this._dependencies.editableColumns) {
            const value = record.getValue(columnName);
            if (value !== undefined) {
                existing[columnName] = value;
                fields.push(columnName);
            }
        }
        return { recordId, success: true, fields };
    }

    public onIsRecordActive(recordId: string): boolean {
        const { dependencies, stateCode } = this._dependencies;
        const record = this._getTask(recordId);
        if (!record) {
            return true;
        }
        return dependencies.onIsRecordActive?.(record) ?? record[stateCode] === 0;
    }

    // ── Task construction ────────────────────────────────────────────────────

    /**
     * Builds a new task record: every known column starts as `null`, the caller's defaults are
     * applied on top, and the primary id, parent lookup and stack rank are computed last so they can
     * never be overridden.
     */
    private _buildTask(parentTaskId?: string, overrides?: Partial<IRawRecord>, placement: Placement = 'first'): IRawRecord {
        const { columns, dependencies, primaryId, parentIdValue, stackRank, stateCode } = this._dependencies;
        const task: IRawRecord = {};
        for (const column of columns) {
            task[column.name] = null;
        }
        Object.assign(task, dependencies.onGetNewTaskDefaults?.(parentTaskId), overrides);
        task[primaryId] = crypto.randomUUID();
        task[parentIdValue] = parentTaskId ?? null;
        task[stackRank] = this._getRankAmongSiblings(parentTaskId ?? null, placement);
        task[stateCode] ??= 0;
        return task;
    }

    /** Appends a task to the caller's array — the write that makes it outlive this strategy. */
    private _addTask(task: IRawRecord): IRawRecord {
        this._dependencies.records.push(task);
        return task;
    }

    /** Maps a template record onto the task fields the two entities share. */
    private _getTaskFieldsFromTemplate(template: IRawRecord): Partial<IRawRecord> {
        const { columns, dependencies, subject } = this._dependencies;
        const metadata = dependencies.templates?.metadata;
        const fields: Partial<IRawRecord> = {};
        for (const column of columns) {
            if (column.name !== metadata?.PrimaryIdAttribute && template[column.name] !== undefined) {
                fields[column.name] = template[column.name];
            }
        }
        if (metadata?.PrimaryNameAttribute) {
            fields[subject] = template[metadata.PrimaryNameAttribute] ?? null;
        }
        return fields;
    }

    /**
     * Captures a task's descendants as template nodes, depth-first. Every visible column is carried
     * over, so whatever the user can see on a task is what the template reproduces.
     */
    private _buildTemplateNodes(taskId: string): IMemoryTaskTemplateNode[] {
        const { primaryId, visibleColumns } = this._dependencies;
        return this._getVisibleChildren(taskId).map(record => ({
            values: Object.fromEntries(visibleColumns.map(columnName => [columnName, record[columnName] ?? null])),
            children: this._buildTemplateNodes(record[primaryId] as string),
        }));
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
        const { records, primaryId } = this._dependencies;
        return records.find(record => record[primaryId] === taskId);
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
        const { records, parentIdValue, primaryId, stackRank } = this._dependencies;
        const ranks = records
            .filter(record => ((record[parentIdValue] as string) ?? null) === parentTaskId
                && record[primaryId] !== excludeTaskId)
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
