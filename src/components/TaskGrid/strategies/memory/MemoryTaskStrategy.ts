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
    ITaskDataProvider,
    ITaskDataProviderStrategy,
    ITaskMoveParams,
} from "@components/TaskGrid/providers";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import {
    IMemoryTaskActivityParams,
    IMemoryTaskAvailableColumnsParams,
    IMemoryTaskAvailableRelatedColumnsParams,
    IMemoryTaskCreateParams,
    IMemoryTaskDeleteParams,
    IMemoryTaskMoveParams,
    IMemoryTaskOpenParams,
    IMemoryTaskSaveParams,
    MemoryTaskActions,
} from "./MemoryTaskActions";

/** What {@link IMemoryTaskStrategyParams.onInitialize} resolves — everything the grid loads with. */
export interface IMemoryTaskInitializeResult {
    /**
     * The task records the grid loads with. Deep-cloned on the way in, so nothing the grid does reaches
     * what you passed.
     *
     * Nothing is kept for you either. To carry what the user did into the next mount, read
     * `taskDataProvider.getRawData()` from the grid's `onBeforeDestroy` prop and hand it back here.
     */
    rawData: IRawRecord[];
    /** Entity metadata. `PrimaryIdAttribute` is required; `LogicalName` is recommended. */
    metadata: IMemoryProviderEntityMetadata;
    /** The columns to load with — usually the active view's, i.e. `provider.getColumns()`. */
    columns: IColumn[];
}

/**
 * Constructor parameters for {@link MemoryTaskStrategy}: the required `onInitialize` hook, and an optional
 * hook per operation.
 *
 * Each optional hook replaces the matching {@link MemoryTaskActions} action and receives its exact
 * parameters, so an override can forward them straight back to it.
 */
export interface IMemoryTaskStrategyParams {
    /**
     * Where the grid's providers, modules and parameters are reached. Resolve in methods, never in the
     * constructor: the strategy is built before the providers it reads.
     */
    services: ITaskGridServiceLocator;
    /**
     * Resolves the records, the metadata and the columns the grid loads with. Awaited inside the
     * strategy's own `onInitialize`, so the grid's loading state covers the work.
     *
     * Whatever it resolves is what every other hook and action then works over.
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
     * resolves the set to delete and lets the provider perform it.
     */
    onDeleteTasks?: (params: IMemoryTaskDeleteParams) => Promise<IDeleteTasksResult>;
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
 * {@link ITaskDataProviderStrategy} implementation backed entirely by in-memory records. Supports the full
 * task surface — create, cascading delete, LexoRank reordering and inline editing — with no server
 * dependency.
 *
 * The behaviour lives in {@link MemoryTaskActions}; each hook here resolves that action's parameters and
 * calls it, unless an override was supplied. Nothing you hand it is ever written to, and nothing is kept
 * across a remount — see the grid's `onBeforeDestroy` prop for keeping what the user did.
 *
 * Normally created by {@link MemoryTaskGridDescriptor}.
 */
export class MemoryTaskStrategy implements ITaskDataProviderStrategy {
    private _params: IMemoryTaskStrategyParams;
    private _services: ITaskGridServiceLocator;
    private _provider!: ITaskDataProvider;

    constructor(params: IMemoryTaskStrategyParams) {
        this._params = params;
        this._services = params.services;
    }

    private get _savedQueryDataProvider(): ISavedQueryDataProvider {
        return this._services.get('savedQueryDataProvider');
    }

    private get _isTaskEditingEnabled(): boolean {
        return this._services.get('gridParameters').enableTaskEditing ?? false;
    }

    // ── ITaskDataProviderStrategy ────────────────────────────────────────────

    public async onInitialize(provider: ITaskDataProvider) {
        this._provider = provider;
        const { rawData, metadata, columns } = await this._params.onInitialize(provider);
        return {
            columns,
            //deep, not just the array: a save and a move write into these objects, and they have to be
            //the provider's rather than the consumer's
            rawData: structuredClone(rawData),
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

    public async onCreateTask(createParams: ITaskCreateParams): Promise<IRawRecord | null> {
        const params: IMemoryTaskCreateParams = {
            ...createParams,
            ...this._store,
            columns: this._provider.getColumns(),
            onGetNewTaskDefaults: this._params.onGetNewTaskDefaults,
        };
        //the override is chosen on whether it exists, never on what it returned: these actions answer
        //`null` for "the user cancelled", and `??` cannot tell that from an override that was never
        //supplied - it would run the default over the cancellation and create the task anyway
        return this._params.onCreateTask
            ? await this._params.onCreateTask(params)
            : await MemoryTaskActions.createTask(params);
    }

    public async onDeleteTasks(taskIds: string[]): Promise<IDeleteTasksResult> {
        const params: IMemoryTaskDeleteParams = {
            taskIds,
            structure: this._provider.getRecordTree().structure,
            onGetRecord: taskId => this._getRecord(taskId),
        };
        //presence, not result - see onCreateTask
        return this._params.onDeleteTasks
            ? await this._params.onDeleteTasks(params)
            : await MemoryTaskActions.deleteTasks(params);
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
        return (await this._params.onOpenDatasetItems?.(params)) ?? null
    }

    public async onMoveTask(moveParams: ITaskMoveParams): Promise<IRawRecord[] | null> {
        const params: IMemoryTaskMoveParams = { ...moveParams, ...this._store };
        //presence, not result - see onCreateTask
        return this._params.onMoveTask
            ? await this._params.onMoveTask(params)
            : await MemoryTaskActions.moveTask(params);
    }

    public async onRecordSave(record: IRecord): Promise<IRecordSaveOperationResult> {
        const params: IMemoryTaskSaveParams = {
            record,
            onGetRecord: taskId => this._getRecord(taskId),
        };
        return await this._params.onRecordSave?.(params)
            ?? MemoryTaskActions.saveRecord(params);
    }

    /** The consumer's last look at the data, called by the provider before it drops it. */

    public onIsRecordActive(recordId: string): boolean {
        const params: IMemoryTaskActivityParams = {
            //the grid only asks about rows it holds, so the record is always there
            record: this._getRecord(recordId)!,
            nativeColumns: this._nativeColumns,
        };
        return this._params.onIsRecordActive?.(params) ?? MemoryTaskActions.isRecordActive(params);
    }

    // ── Derived state ────────────────────────────────────────────────────────

    /** What every action reads: the provider's records and the names on them. */
    private get _store(): { records: IRawRecord[]; metadata: IMemoryProviderEntityMetadata; nativeColumns: INativeColumns } {
        return {
            records: this._records,
            metadata: this._metadata,
            nativeColumns: this._nativeColumns,
        };
    }

    /** The provider's records — the store. Read at call time, because the provider maintains it. */
    private get _records(): IRawRecord[] {
        return this._provider.getRawData();
    }

    /** The entity metadata, owned by the provider — it was handed it by `onInitialize`. */
    private get _metadata(): IMemoryProviderEntityMetadata {
        return this._provider.getMetadata();
    }

    /** The physical field names the descriptor mapped, owned by the provider. */
    private get _nativeColumns(): INativeColumns {
        return this._provider.getNativeColumns();
    }

    /**
     * The grid's record instance for a task — what the actions work with. It carries the reads
     * (`getValue`, `getNamedReference`) and, through `getRawData()`, the very object in the caller's
     * array, so nothing needs a raw lookup of its own.
     */
    private _getRecord(taskId: string): IRecord | undefined {
        return this._provider.getRecordsMap()[taskId];
    }

    /**
     * The raw record for a task, for `onGetRawRecords` alone — the one hook that has to answer in raw
     * data. Reads the provider's own map, which holds the very objects it was handed.
     */
    private _getTask(taskId: string): IRawRecord | undefined {
        return this._provider.getRawDataMap()[taskId];
    }
}
