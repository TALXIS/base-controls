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

/** Seed data and behaviour resolved by {@link IMemoryTaskStrategyParams.onInitialize}. */
export interface IMemoryTaskStrategyDependencies {
    /** The task entity: seed records, column definitions and metadata. */
    tasks: IMemoryEntitySource;
    /**
     * Task templates: the template entity plus the child hierarchy each template expands into.
     * Omit to leave template-based task creation disabled.
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

/**
 * Everything derived once from the resolved dependencies and the provider's field mapping. Computed
 * in `onInitialize` so the physical field names are resolved in a single place rather than on every
 * read, and so a hook running before initialization fails with one clear message.
 */
interface IResolvedState {
    dependencies: IMemoryTaskStrategyDependencies;
    columns: IColumn[];
    /** Primary key attribute of the task entity. */
    primaryId: string;
    /** Raw key holding the parent lookup's value. Dataverse shape: `_<lookup>_value`. */
    parentIdValue: string;
    stackRank: string;
    stateCode: string;
    subject: string;
    /** Non-hidden column names — the fields a user can see, edit, and capture into a template. */
    visibleColumns: string[];
    /** Columns `onRecordSave` may write — every visible column, plus state code so the active toggle works. */
    editableColumns: string[];
}

/**
 * {@link ITaskDataProviderStrategy} implementation backed entirely by in-memory records.
 *
 * Supports the full task surface — create, delete (cascading to descendants), drag-and-drop
 * reordering via LexoRank, templates, and inline editing — without any server or Dataverse
 * dependency. Intended for local development, tests, Storybook and demos.
 *
 * All state is scoped to the instance: the seed records are deep-cloned on initialization, so the
 * fixture you pass in is never mutated and two grids never share data.
 *
 * Normally created by {@link MemoryTaskGridDescriptor}; construct it directly when you supply your
 * own descriptor, or subclass it to override a single hook.
 */
export class MemoryTaskStrategy implements ITaskDataProviderStrategy {
    private _onInitialize: () => Promise<IMemoryTaskStrategyDependencies>;
    private _isTaskEditingEnabled: boolean;
    private _templateDataProvider?: IDataProvider;
    private _state?: IResolvedState;
    private _tasks: Map<string, IRawRecord> = new Map();
    private _templateChildren: Record<string, IMemoryTaskTemplateNode[]> = {};
    private _taskTree!: IRecordTree;

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
        const columns = tasks.columns;
        const visibleColumns = columns.filter(column => !column.isHidden).map(column => column.name);
        this._state = {
            dependencies: dependencies,
            columns: columns,
            primaryId: tasks.metadata.PrimaryIdAttribute!,
            parentIdValue: `_${fieldMapping.parentId}_value`,
            stackRank: fieldMapping.stackRank,
            stateCode: fieldMapping.stateCode,
            subject: fieldMapping.subject,
            visibleColumns: visibleColumns,
            editableColumns: [...visibleColumns, fieldMapping.stateCode],
        };
        //cloned so the caller's fixture is never mutated - it may be a shared module-level array
        this._tasks = new Map(
            structuredClone(tasks.records).map(record => [record[this._state!.primaryId] as string, record]),
        );
        this._templateChildren = structuredClone(dependencies.templates?.children ?? {});
        return {
            columns: provider.getColumns(),
            rawData: [...this._tasks.values()],
            metadata: tasks.metadata,
        };
    }

    public async onGetRawRecords(ids: string[]): Promise<IRawRecord[]> {
        return ids.flatMap(id => {
            const record = this._tasks.get(id);
            return record ? [record] : [];
        });
    }

    public async onGetAvailableColumns(_options?: IAvailableColumnOptions): Promise<IColumn[]> {
        return this._getState().columns.filter(column => !column.isHidden);
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
            if (this._tasks.delete(id)) {
                deletedTaskIds.push(id);
            }
        }
        return { success: true, deletedTaskIds };
    }

    public async onCreateTemplateFromTask(taskId: string): Promise<IRawRecord | null> {
        const { templates } = this._getState().dependencies;
        const task = this._tasks.get(taskId);
        const templateProvider = this._templateDataProvider;
        if (!task || !templates || !templateProvider) {
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
            template[PrimaryNameAttribute] = task[this._getState().subject] ?? null;
        }

        const children = this._buildTemplateNodes(taskId);
        if (children.length > 0) {
            this._templateChildren[templateId] = children;
        }
        //the provider owns the live template list, so append there rather than to the seed fixture
        templateProvider.setDataSource([...templateProvider.getRawData(), template]);
        return template;
    }

    public async onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null> {
        const template = this._templateDataProvider?.getRecordsMap()[templateId]?.getRawData();
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
                    createChildren(node.children, child[this._getState().primaryId] as string);
                }
            }
        };
        createChildren(this._templateChildren[templateId] ?? [], rootTask[this._getState().primaryId] as string);

        return created;
    }

    public async onOpenDatasetItems(
        entityReferences: ComponentFramework.EntityReference[],
        isTaskEntity: boolean,
    ): Promise<IOpenDatasetItemsResult | null> {
        return await this._getState().dependencies.onOpenDatasetItems?.(entityReferences, isTaskEntity, {
            isTaskEditingEnabled: this._isTaskEditingEnabled,
        }) ?? null;
    }

    public async onMoveTask(
        movingTaskId: string,
        targetTaskId: string,
        position: 'above' | 'below' | 'child',
    ): Promise<IRawRecord[] | null> {
        const { parentIdValue, stackRank } = this._getState();
        const moving = this._tasks.get(movingTaskId);
        const target = this._tasks.get(targetTaskId);
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
            .filter(record => record[this._getState().primaryId] !== movingTaskId);
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
        const existing = this._tasks.get(recordId);
        if (!existing) {
            return { recordId, success: false, fields: [], errors: [{ message: `Task "${recordId}" no longer exists.` }] };
        }
        const fields: string[] = [];
        for (const columnName of this._getState().editableColumns) {
            const value = record.getValue(columnName);
            if (value !== undefined) {
                existing[columnName] = value;
                fields.push(columnName);
            }
        }
        return { recordId, success: true, fields };
    }

    public onIsRecordActive(recordId: string): boolean {
        const { dependencies, stateCode } = this._getState();
        const record = this._tasks.get(recordId);
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
        const { columns, dependencies, primaryId, parentIdValue, stackRank, stateCode } = this._getState();
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

    private _addTask(task: IRawRecord): IRawRecord {
        this._tasks.set(task[this._getState().primaryId] as string, task);
        return task;
    }

    /** Maps a template record onto the task fields the two entities share. */
    private _getTaskFieldsFromTemplate(template: IRawRecord): Partial<IRawRecord> {
        const { columns, dependencies, subject } = this._getState();
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
        const { primaryId, visibleColumns } = this._getState();
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
            .map(child => this._tasks.get(child.getRecordId()))
            .filter((record): record is IRawRecord => !!record);
    }

    // ── Stack rank ───────────────────────────────────────────────────────────

    /**
     * Returns a rank placing a record at the start or end of a parent's children.
     *
     * Siblings are read from the store rather than the tree so that records hidden by the active view
     * still participate — otherwise a new task could collide with a filtered-out one.
     *
     * @param excludeTaskId — a task to ignore, so a record being moved is not ranked against itself.
     */
    private _getRankAmongSiblings(parentTaskId: string | null, placement: Placement, excludeTaskId?: string): string {
        const { parentIdValue, primaryId, stackRank } = this._getState();
        const ranks = [...this._tasks.values()]
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

    // ── Accessors ────────────────────────────────────────────────────────────

    private _getState(): IResolvedState {
        if (!this._state) {
            throw new Error('MemoryTaskStrategy has not been initialized yet. The TaskGrid calls onInitialize before any other hook.');
        }
        return this._state;
    }
}
