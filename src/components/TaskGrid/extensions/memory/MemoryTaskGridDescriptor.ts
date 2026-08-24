import { IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { ICustomColumnsModule, IGridCustomizerModule, ILookupManyModule, ITaskGridModules, ITemplateModule, IUserQueryModule } from "@components/TaskGrid/modules/interfaces";
import { ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, IUserQueryStrategy } from "@components/TaskGrid/providers";
import { MemoryTaskStrategy } from "./memory-task-strategy/MemoryTaskStrategy";

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

/**
 * The feature modules a memory grid can run with, one builder per feature. Omit a key and that feature
 * is off.
 *
 * None of these builders take a parameter: they close over whatever `onInitialize` already resolved.
 */
export interface IMemoryModules {
    /** Personal views. `createUserQueryModule({ strategy: new MemoryUserQueryStrategy({ userQueries }) })`. */
    onGetUserQueriesModule?: () => IUserQueryModule | undefined;
    /** Task templates. `createTemplateModule({ provider: new MemoryTemplateDataProvider({ templates }) })`. */
    onGetTemplatesModule?: () => ITemplateModule | undefined;
    /**
     * User-defined columns. `createCustomColumnsModule({ strategy })` — no in-memory strategy ships, so
     * the strategy is your own.
     */
    onGetCustomColumnsModule?: () => ICustomColumnsModule | undefined;
    /** AG Grid customization. `createGridCustomizerModule({ strategy })`. */
    onGetGridCustomizerModule?: () => IGridCustomizerModule | undefined;
    /**
     * Candidate records for lookup-many columns. `createLookupManyModule({ createDataProvider })`, where
     * `MemoryLookupManyDataProviderFactory.create` turns records you hold into the provider.
     *
     * Which columns render as lookup-many is driven by `metadata.LookupMany` on the column itself.
     */
    onGetLookupManyModule?: () => ILookupManyModule | undefined;
}

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IMemoryTaskStrategyContext extends IMemoryStrategyContext {
    /** The providers and flags the grid built. Forward them to the strategy's second argument. */
    deps: ITaskStrategyDeps;
}

/** What {@link IMemoryTaskGridDescriptorParams.onInitialize} resolves. */
export interface IMemoryTaskGridDescriptorInitializeResult {
    /**
     * The task records. Edits and moves write through to these objects, so they survive a remount;
     * creations and deletions land on the provider's own copy and do not — see
     * {@link IMemoryEntitySource.records}.
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
    /** The feature modules this grid runs with, one builder per feature. See {@link IMemoryModules}. */
    modules?: IMemoryModules;
}

/** Constructor parameters for {@link MemoryTaskGridDescriptor}. */
export interface IMemoryTaskGridDescriptorParams {
    /**
     * Resolves everything: the records, the metadata, the field mapping, the system views, the grid
     * parameters, the task strategy and the feature modules. Awaited before any strategy or data
     * provider is created, so the work is covered by the grid's loading state.
     *
     * Called again on every remount, so it is not a seed — anything that must survive one lives in a
     * store you own, and this returns its current value on every call.
     */
    onInitialize: () => Promise<IMemoryTaskGridDescriptorInitializeResult>;
    /** Container height. Read synchronously, before `onInitialize` resolves, for the loading skeleton. */
    height?: string;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} backed entirely by in-memory data — no Dataverse, no
 * network, no `Xrm.WebApi`. Intended for local development, tests, Storybook and demos.
 *
 * `onInitialize` is the single point of configuration entry: the data, the task strategy and the feature
 * modules are all part of what it resolves. `height` is the only other constructor parameter.
 *
 * @example
 * ```ts
 * const descriptor = new MemoryTaskGridDescriptor({
 *   height: '600px',
 *   onInitialize: async () => {
 *     const { TASKS, TASK_METADATA } = await import('./fixtures');
 *     return {
 *       records: TASKS, metadata: TASK_METADATA,
 *       fieldMapping: { subject: 'subject', parentId: 'parentid', stackRank: 'stackrank', stateCode: 'statecode' },
 *       systemQueries: [allTasksView],
 *       modules: {
 *         onGetUserQueriesModule: () => createUserQueryModule({ strategy: new MemoryUserQueryStrategy({ userQueries }) }),
 *       },
 *     };
 *   },
 * });
 * ```
 */
export class MemoryTaskGridDescriptor implements ITaskGridDescriptor {
    private _params: IMemoryTaskGridDescriptorParams;
    /** Whatever the last `onLoadDependencies()` call resolved. */
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

    public onGetHeight(): string | undefined {
        return this._params.height;
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

    /** Calls each builder on the `modules` resolved by `onInitialize`. An absent builder leaves that feature off. */
    public onGetModules(): ITaskGridModules {
        const modules = this._getData().modules;
        return {
            userQueries: modules?.onGetUserQueriesModule?.(),
            templates: modules?.onGetTemplatesModule?.(),
            customColumns: modules?.onGetCustomColumnsModule?.(),
            gridCustomizer: modules?.onGetGridCustomizerModule?.(),
            lookupMany: modules?.onGetLookupManyModule?.(),
        };
    }

    /**
     * Delegates to the `onCreateTaskStrategy` resolved by `onInitialize`, falling back to a plain
     * `MemoryTaskStrategy` over the resolved records.
     */
    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        const { records, metadata } = this._getData();
        return this._getData().onCreateTaskStrategy?.({ ...this._getStrategyContext(), deps })
            ?? new MemoryTaskStrategy({
                onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
            }, deps);
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
