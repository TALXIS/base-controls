import { IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy } from "@controls/task-grid/providers";
import { MemoryTaskStrategy } from "@controls/task-grid/strategies/memory/MemoryTaskStrategy";

/** What the descriptor has resolved by the time it builds an optional strategy. */
export interface IMemoryStrategyContext {
    /** The task records resolved by `onInitialize` — the array the strategies write into. */
    records: IRawRecord[];
    /** The task entity metadata resolved by `onInitialize`. */
    metadata: IMemoryProviderEntityMetadata;
    /** The system views resolved by `onInitialize`. */
    systemQueries: ISavedQuery[];
}

/**
 * What the descriptor hands the lookup-many callback: the cell the picker belongs to. The candidates come
 * from records you hold, so pick the source by `column.name`.
 */
export type IMemoryLookupManyParameters = ILookupManyDataProviderParameters;

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IMemoryTaskStrategyContext extends IMemoryStrategyContext {
    /** Everything the grid built. Forward it to the strategy's `services`. */
    services: ITaskGridServiceLocator;
}

/** What {@link IMemoryTaskGridDescriptorParams.onInitialize} resolves. */
export interface IMemoryTaskGridDescriptorInitializeResult {
    /**
     * The task records the grid starts with. What the user does to them is kept across views, but not
     * across mounts; never written into this array.
     */
    records: IRawRecord[];
    /** Task entity metadata. `PrimaryIdAttribute` is required; `LogicalName` is recommended. */
    metadata: IMemoryProviderEntityMetadata;
    /** Maps the column roles the grid needs (subject, parent, stack rank, state code) onto your column names. */
    fieldMapping: IFieldMapping;
    /** Built-in, non-deletable views shown in the view switcher — and the source of every column definition. At least one is required. */
    systemQueries: ISavedQuery[];
    /** Feature flags forwarded to the grid. See {@link ITaskGridParameters}. */
    gridParameters?: ITaskGridParameters;
    /**
     * Supplies the task strategy, and with it every task-level option. Omit it and the descriptor builds
     * a plain `MemoryTaskStrategy` over the resolved records.
     */
    onCreateTaskStrategy?: (context: IMemoryTaskStrategyContext) => ITaskDataProviderStrategy;
}

export interface IMemoryTaskGridDescriptorParams {
    /**
     * Resolves everything: the records, the metadata, the field mapping, the system views, the grid
     * parameters and the task strategy. Awaited once per mount, before any strategy or data provider is
     * created, so the work is covered by the grid's loading state.
     *
     * Called again on every mount, so it is not a seed — anything that must survive one lives in a store
     * you own, and this returns its current value on every call.
     */
    onInitialize: () => Promise<IMemoryTaskGridDescriptorInitializeResult>;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} backed entirely by in-memory data — no Dataverse, no
 * network, no `Xrm.WebApi`. Intended for local development, tests, Storybook and demos.
 *
 * `onInitialize` is the single point of configuration entry: the data and the task strategy are what it
 * resolves; the features go on `TaskGrid` itself.
 *
 * @example
 * ```ts
 * const descriptor = new MemoryTaskGridDescriptor({
 *   onInitialize: async () => {
 *     const { TASKS, TASK_METADATA } = await import('./fixtures');
 *     return {
 *       records: TASKS, metadata: TASK_METADATA,
 *       fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
 *       systemQueries: [allTasksView],
 *     };
 *   },
 * });
 * ```
 */
export class MemoryTaskGridDescriptor implements ITaskGridDescriptor {
    private _params: IMemoryTaskGridDescriptorParams;
    //whatever the last `onLoadDependencies()` call resolved.
    private _initialized!: IMemoryTaskGridDescriptorInitializeResult;

    constructor(params: IMemoryTaskGridDescriptorParams) {
        this._params = params;
    }

    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    /** Resolves `onInitialize` and checks that at least one system query came back. */
    public async onLoadDependencies(): Promise<void> {
        const initialized = await this._params.onInitialize();
        if (initialized.systemQueries.length === 0) {
            throw new Error('MemoryTaskGridDescriptor requires at least one system query.');
        }
        this._initialized = initialized;
    }

    public onGetFieldMapping(): IFieldMapping {
        return this._getData().fieldMapping;
    }

    public onGetGridParameters(): ITaskGridParameters {
        return this._getData().gridParameters ?? {};
    }

    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        const data = this._getData();
        return {
            onGetSystemQueries: async () => data.systemQueries,
        };
    }

    /**
     * Delegates to the `onCreateTaskStrategy` resolved by `onInitialize`, falling back to a plain
     * `MemoryTaskStrategy` over the resolved records.
     */
    public onCreateTaskStrategy({ services }: ITaskGridFactoryParams): ITaskDataProviderStrategy {
        const data = this._getData();
        return data.onCreateTaskStrategy?.({ ...this._getStrategyContext(), services })
            ?? new MemoryTaskStrategy({
                onInitialize: async provider => ({ rawData: data.records, metadata: data.metadata, columns: provider.getColumns() }),
                onDestroy: provider => data.records = provider.getRawData(),
                services: services,
            });
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private _getStrategyContext(): IMemoryStrategyContext {
        const { records, metadata, systemQueries } = this._getData();
        return { records, metadata, systemQueries };
    }

    private _getData(): IMemoryTaskGridDescriptorInitializeResult {
        return this._initialized;
    }
}
