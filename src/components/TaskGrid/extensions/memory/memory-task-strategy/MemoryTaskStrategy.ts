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
import { INativeColumns, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { MemoryTemplateDataProvider } from "../MemoryTemplateDataProvider";
import {
    IMemoryTaskActivityParams,
    IMemoryTaskAvailableColumnsParams,
    IMemoryTaskAvailableRelatedColumnsParams,
    IMemoryTaskCreateParams,
    IMemoryTaskDeleteParams,
    IMemoryTaskMoveParams,
    IMemoryTaskOpenParams,
    IMemoryTaskSaveParams,
    IMemoryTaskTemplateExpansionParams,
    MemoryTaskActions,
} from "./MemoryTaskActions";

/** What {@link IMemoryTaskStrategyParams.onInitialize} resolves — everything the grid loads with. */
export interface IMemoryTaskInitializeResult {
    /**
     * The task records. **This array is written into.** Creating, deleting, editing and moving tasks
     * mutates it, which is how the data outlives this strategy — the grid rebuilds the strategy on
     * every remount and the hook hands back the same array.
     *
     * The grid is given a copy of it, because the data provider swaps its own array on delete.
     */
    rawData: IRawRecord[];
    /** Entity metadata. `PrimaryIdAttribute` is required; `LogicalName` is recommended. */
    metadata: IMemoryProviderEntityMetadata;
    /** The columns to load with — usually the active view's, i.e. `provider.getColumns()`. */
    columns: IColumn[];
}

/**
 * Constructor parameters for {@link MemoryTaskStrategy}: the required `onInitialize` hook, and an
 * optional hook per operation.
 *
 * Every optional hook overrides one of the strategy's own, and receives exactly the parameters the
 * matching {@link MemoryTaskActions} action takes — so an override that only needs to do something
 * *around* the shipped behaviour can forward them straight back to it:
 *
 * ```ts
 * onDeleteTasks: async params => {
 *     await audit(params.taskIds);
 *     return MemoryTaskActions.deleteTasks(params);
 * },
 * ```
 */
export interface IMemoryTaskStrategyParams {
    /**
     * Resolves the records, the metadata and the columns the grid loads with. Awaited from inside the
     * strategy's own `onInitialize`, which the TaskGrid already treats as asynchronous — so the grid's
     * loading state covers the work and nothing has to be available at construction time.
     *
     * Whatever it resolves is also the store every other hook and action then works over.
     *
     * ```ts
     * onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
     * ```
     */
    onInitialize: (provider: ITaskDataProvider) => Promise<IMemoryTaskInitializeResult>;
    /**
     * Field values applied to newly created tasks. Merged over a record in which every known column
     * is `null`; the primary id, parent lookup and stack rank are always computed by the strategy.
     */
    onGetNewTaskDefaults?: (parentTaskId?: string) => Partial<IRawRecord>;
    /**
     * Determines whether a task counts as active. Defaults to {@link MemoryTaskActions.isRecordActive} —
     * `record[stateCode] == 0`, using the state-code column from the descriptor's field mapping.
     *
     * ```ts
     * onIsRecordActive: params => params.record.isarchived
     *     ? false
     *     : MemoryTaskActions.isRecordActive(params),
     * ```
     */
    onIsRecordActive?: (params: IMemoryTaskActivityParams) => boolean;
    /**
     * Supplies the column catalogue the Edit columns panel offers. Defaults to
     * {@link MemoryTaskActions.getAvailableColumns} — every column any view defines.
     */
    onGetAvailableColumns?: (params: IMemoryTaskAvailableColumnsParams) => Promise<IColumn[]>;
    /**
     * Supplies the related columns the Edit columns panel offers. Defaults to
     * {@link MemoryTaskActions.getAvailableRelatedColumns}, which offers none — in-memory data carries
     * no relationship metadata to walk.
     */
    onGetAvailableRelatedColumns?: (params: IMemoryTaskAvailableRelatedColumnsParams) => Promise<IAvailableRelatedColumn[]>;
    /**
     * Creates one task. Defaults to {@link MemoryTaskActions.createTask}, which appends a record built
     * from the active view's columns and {@link onGetNewTaskDefaults}.
     */
    onCreateTask?: (params: IMemoryTaskCreateParams) => Promise<IRawRecord | null>;
    /**
     * Deletes tasks and their descendants. Defaults to {@link MemoryTaskActions.deleteTasks}, which
     * rewrites the record array in place.
     */
    onDeleteTasks?: (params: IMemoryTaskDeleteParams) => Promise<IDeleteTasksResult>;
    /**
     * Expands a template into a task subtree. Defaults to
     * {@link MemoryTaskActions.createTasksFromTemplate}. Only reached when a template data provider was
     * supplied, so the grid offers the command in the first place.
     */
    onCreateTasksFromTemplate?: (params: IMemoryTaskTemplateExpansionParams) => Promise<IRawRecord[] | null>;
    /**
     * Invoked when the user opens task(s) or a related record — the memory equivalent of navigating
     * to a form. Defaults to {@link MemoryTaskActions.openDatasetItems}, a no-op that leaves the grid
     * untouched.
     */
    onOpenDatasetItems?: (params: IMemoryTaskOpenParams) => Promise<IOpenDatasetItemsResult | null>;
    /**
     * Reorders or reparents a task. Defaults to {@link MemoryTaskActions.moveTask}, which rewrites the
     * moved record's parent lookup and LexoRank stack rank.
     */
    onMoveTask?: (params: IMemoryTaskMoveParams) => Promise<IRawRecord[] | null>;
    /**
     * Persists an inline edit. Defaults to {@link MemoryTaskActions.saveRecord}, which writes the dirty
     * fields onto the stored record.
     */
    onRecordSave?: (params: IMemoryTaskSaveParams) => Promise<IRecordSaveOperationResult>;
}

/**
 * {@link ITaskDataProviderStrategy} implementation backed entirely by in-memory records.
 *
 * Supports the full task surface — create, delete (cascading to descendants), drag-and-drop
 * reordering via LexoRank, templates, and inline editing — without any server or Dataverse
 * dependency.
 *
 * The strategy keeps no data of its own. It reads and writes the array its `onInitialize` hook
 * resolves, the way a Dataverse strategy reads and writes the server — which is what lets the grid
 * recreate it on every remount without losing anything the user did.
 *
 * The behaviour itself lives in {@link MemoryTaskActions}: every hook below resolves the parameters that
 * action needs and calls it, unless `onInitialize` supplied an override for it.
 *
 * Normally created by {@link MemoryTaskGridDescriptor}; construct it directly when you supply your
 * own descriptor, or subclass it to override a single hook.
 */
export class MemoryTaskStrategy implements ITaskDataProviderStrategy {
    private _params: IMemoryTaskStrategyParams;
    private _isTaskEditingEnabled: boolean;
    private _savedQueryDataProvider: ISavedQueryDataProvider;
    /**
     * The provider that owns the template source. Narrowed to the memory implementation, the way the
     * Dataverse strategy narrows its custom-columns strategy — expanding a template needs the child
     * hierarchy, which only the memory provider knows about.
     */
    private _templateDataProvider?: MemoryTemplateDataProvider;
    private _provider!: ITaskDataProvider;
    /**
     * The array `onInitialize` resolved — the store every hook and action works over.
     *
     * The one thing kept from the initialize result: the metadata and the columns are read back off the
     * provider, but the store cannot be. The provider is handed a *copy* and rebuilds its own array on
     * delete, so writing through it would leave the consumer's array behind.
     */
    private _records!: IRawRecord[];

    /** @param params — see {@link IMemoryTaskStrategyParams}. */
    constructor(params: IMemoryTaskStrategyParams, deps: ITaskStrategyDeps) {
        this._params = params;
        this._isTaskEditingEnabled = deps.enableTaskEditing;
        this._savedQueryDataProvider = deps.savedQueryDataProvider;
        this._templateDataProvider = deps.templateDataProvider as MemoryTemplateDataProvider | undefined;
    }

    // ── ITaskDataProviderStrategy ────────────────────────────────────────────

    /** Called directly — there is no default to fall back to, so nothing here belongs in the actions. */
    public async onInitialize(provider: ITaskDataProvider) {
        this._provider = provider;
        const { rawData, metadata, columns } = await this._params.onInitialize(provider);
        this._records = rawData;
        return {
            columns,
            //a copy of the array holding the same records: the provider replaces its own array on
            //delete, so it must not be handed the one we write to
            rawData: [...rawData],
            metadata,
        };
    }

    public async onGetRawRecords(ids: string[]): Promise<IRawRecord[]> {
        return ids.flatMap(id => {
            const record = this._getTask(id);
            return record ? [record] : [];
        });
    }

    public async onGetAvailableColumns(options?: IAvailableColumnOptions): Promise<IColumn[]> {
        const params: IMemoryTaskAvailableColumnsParams = {
            savedQueryDataProvider: this._savedQueryDataProvider,
            options,
        };
        return await this._params.onGetAvailableColumns?.(params)
            ?? MemoryTaskActions.getAvailableColumns(params);
    }

    public async onGetAvailableRelatedColumns(): Promise<IAvailableRelatedColumn[]> {
        const params: IMemoryTaskAvailableRelatedColumnsParams = { metadata: this._metadata };
        return await this._params.onGetAvailableRelatedColumns?.(params)
            ?? MemoryTaskActions.getAvailableRelatedColumns(params);
    }

    public async onCreateTask(parentTaskId?: string): Promise<IRawRecord | null> {
        const params: IMemoryTaskCreateParams = {
            ...this._store,
            parentTaskId,
            columns: this._provider.getColumns(),
            onGetNewTaskDefaults: this._params.onGetNewTaskDefaults,
        };
        return await this._params.onCreateTask?.(params)
            ?? MemoryTaskActions.createTask(params);
    }

    public async onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult> {
        const params: IMemoryTaskDeleteParams = {
            ...this._store,
            taskIds,
            onGetTask: taskId => this._getTask(taskId),
        };
        return await this._params.onDeleteTasks?.(params)
            ?? MemoryTaskActions.deleteTasks(params);
    }

    public async onCreateTasksFromTemplate(templateId: string, parentTaskId?: string): Promise<IRawRecord[] | null> {
        const templateDataProvider = this._templateDataProvider;
        if (!templateDataProvider) {
            return null;
        }
        const params: IMemoryTaskTemplateExpansionParams = {
            ...this._store,
            templateId,
            parentTaskId,
            templateDataProvider,
            columns: this._provider.getColumns(),
            onGetNewTaskDefaults: this._params.onGetNewTaskDefaults,
        };
        return await this._params.onCreateTasksFromTemplate?.(params)
            ?? MemoryTaskActions.createTasksFromTemplate(params);
    }

    public async onOpenDatasetItems(
        entityReferences: ComponentFramework.EntityReference[],
        isTaskEntity: boolean,
    ): Promise<IOpenDatasetItemsResult | null> {
        const params: IMemoryTaskOpenParams = {
            entityReferences,
            isTaskEntity,
            isTaskEditingEnabled: this._isTaskEditingEnabled,
        };
        //This will carry form dependency in the future, so the default is a no-op that leaves the grid untouched
        return (await this._params.onOpenDatasetItems?.(params)) ?? null
    }

    public async onMoveTask(
        movingTaskId: string,
        targetTaskId: string,
        position: 'above' | 'below' | 'child',
    ): Promise<IRawRecord[] | null> {
        const params: IMemoryTaskMoveParams = {
            ...this._store,
            movingTaskId,
            targetTaskId,
            position,
            recordTree: this._provider.getRecordTree(),
            onGetTask: taskId => this._getTask(taskId),
        };
        return await this._params.onMoveTask?.(params)
            ?? MemoryTaskActions.moveTask(params);
    }

    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const params: IMemoryTaskSaveParams = {
            record,
            onGetTask: taskId => this._getTask(taskId),
        };
        return await this._params.onRecordSave?.(params)
            ?? MemoryTaskActions.saveRecord(params);
    }

    public onIsRecordActive(recordId: string): boolean {
        const params: IMemoryTaskActivityParams = {
            //the grid only asks about rows it holds, so the record is always there
            record: this._getTask(recordId)!,
            nativeColumns: this._nativeColumns,
        };
        return this._params.onIsRecordActive?.(params) ?? MemoryTaskActions.isRecordActive(params);
    }

    // ── Derived state ────────────────────────────────────────────────────────

    /** The store every action reads and writes: the caller's array and the names on it. */
    private get _store(): { records: IRawRecord[]; metadata: IMemoryProviderEntityMetadata; nativeColumns: INativeColumns } {
        return {
            records: this._records,
            metadata: this._metadata,
            nativeColumns: this._nativeColumns,
        };
    }

    /** The entity metadata, owned by the provider — it was handed it by `onInitialize`. */
    private get _metadata(): IMemoryProviderEntityMetadata {
        return this._provider.getMetadata();
    }

    private get _primaryId(): string {
        return this._metadata.PrimaryIdAttribute!;
    }

    /** The physical field names the descriptor mapped, owned by the provider. */
    private get _nativeColumns(): INativeColumns {
        return this._provider.getNativeColumns();
    }

    /**
     * The stored record for a task. Reads the provider's own raw-data map, which holds the very objects
     * this strategy was handed — the provider does not copy them — so a hit is O(1) and still writable.
     * Falls back to a scan for the window before the provider has loaded its data.
     */
    private _getTask(taskId: string): IRawRecord | undefined {
        return this._provider.getRawDataMap()[taskId]
            ?? this._records.find(record => record[this._primaryId] === taskId);
    }
}
