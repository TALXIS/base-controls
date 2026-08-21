import { IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { ICustomColumnsModule, IGridCustomizerModule, ILookupManyModule, ITaskGridModules, ITemplateModule, IUserQueryModule } from "@components/TaskGrid/modules/interfaces";
import { ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, IUserQueryStrategy } from "@components/TaskGrid/providers";
import { MemoryTaskStrategy } from "./memory-task-strategy/MemoryTaskStrategy";

/**
 * What the descriptor has resolved by the time it asks for an optional strategy — the counterpart to
 * `IDataverseStrategyContext`.
 */
export interface IMemoryStrategyContext {
    /** The task records resolved by `onInitialize` — the array the strategies write into. */
    records: IRawRecord[];
    /** The task entity metadata resolved by `onInitialize`. */
    metadata: IMemoryProviderEntityMetadata;
    /** The system views resolved by `onInitialize`. */
    systemQueries: ISavedQuery[];
}

/**
 * What the descriptor hands the lookup-many callback: the cell the picker belongs to, and nothing else —
 * the candidates come from records you hold, so pick the source by `column.name`. Aliased rather than
 * extended so the counterpart to `IDataverseLookupManyParameters` still has a name of its own.
 */
export type IMemoryLookupManyParameters = ILookupManyDataProviderParameters;

/**
 * The feature modules a memory grid can run with, one builder per feature. None of the shipped
 * implementations (`MemoryUserQueryStrategy`, `MemoryTemplateDataProvider`,
 * `MemoryLookupManyDataProviderFactory`) read anything off {@link IMemoryStrategyContext} — they close
 * over whatever you already resolved in `onInitialize` instead — so none of these builders take a
 * parameter. A strategy of your own that does need something from it (a custom-columns strategy wanting
 * `metadata`, say) can still close over the same variables `onInitialize` populated.
 */
export interface IMemoryModules {
    /**
     * ```ts
     * onGetUserQueriesModule: () => createUserQueryModule({
     *     strategy: new MemoryUserQueryStrategy({ userQueries }),
     *     enableQueryManager: true,
     * })
     * ```
     */
    onGetUserQueriesModule?: () => IUserQueryModule | undefined;
    /**
     * ```ts
     * onGetTemplatesModule: () => createTemplateModule({ provider: new MemoryTemplateDataProvider({ templates }) })
     * ```
     */
    onGetTemplatesModule?: () => ITemplateModule | undefined;
    /**
     * There is no in-memory custom-columns implementation, so this is your own strategy.
     *
     * ```ts
     * onGetCustomColumnsModule: () => createCustomColumnsModule({ strategy: new MyCustomColumnsStrategy() })
     * ```
     */
    onGetCustomColumnsModule?: () => ICustomColumnsModule | undefined;
    /**
     * ```ts
     * onGetGridCustomizerModule: () => createGridCustomizerModule({ strategy: new MyGridCustomizerStrategy() })
     * ```
     */
    onGetGridCustomizerModule?: () => IGridCustomizerModule | undefined;
    /**
     * Which columns render as lookup-many is driven by `metadata.LookupMany` on the column itself; this
     * is what feeds them — `MemoryLookupManyDataProviderFactory` turns records you hold into the provider.
     *
     * ```ts
     * onGetLookupManyModule: () => createLookupManyModule({
     *     createDataProvider: ({ column }) => MemoryLookupManyDataProviderFactory.create(SOURCES[column.name]),
     * })
     * ```
     */
    onGetLookupManyModule?: () => ILookupManyModule | undefined;
}

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IMemoryTaskStrategyContext extends IMemoryStrategyContext {
    /** The providers and flags the grid built. Forward them to the strategy's second argument. */
    deps: ITaskStrategyDeps;
}

/**
 * What {@link IMemoryTaskGridDescriptorParams.onInitialize} resolves: the data the grid loads with, plus
 * the behaviour that depends on it. `onInitialize` is the single point of configuration entry — the only
 * other constructor parameter is `height`, needed synchronously for the loading skeleton before any of
 * this exists.
 */
export interface IMemoryTaskGridDescriptorInitializeResult {
    /**
     * The task records. **This array is written into** — creating, deleting, editing and moving tasks
     * mutates it, which is how the data outlives the grid's remounts.
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
     * (Optional) Supplies the task strategy — this is where every task-level option goes:
     *
     * ```ts
     * onCreateTaskStrategy: ({ deps, records, metadata }) => new MemoryTaskStrategy({
     *     onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
     *     onGetNewTaskDefaults: () => ({ statuscode: 1, priority: 1 }),
     *     onIsRecordActive: ({ record }) => record.statuscode !== 5,
     *     onOpenDatasetItems: async ({ entityReferences }) => { … },
     * }, deps)
     * ```
     *
     * Omit it and the descriptor builds a plain `MemoryTaskStrategy` over the resolved records.
     */
    onCreateTaskStrategy?: (context: IMemoryTaskStrategyContext) => ITaskDataProviderStrategy;
    /**
     * (Optional) Supplies the feature modules, one builder function per feature — see
     * {@link IMemoryModules} for what each one does. Omit a key and that feature is off, which also lets
     * its code be tree-shaken away.
     */
    modules?: IMemoryModules;
}

/**
 * Constructor parameters for {@link MemoryTaskGridDescriptor}: the required `onInitialize` hook and the
 * container height. `onInitialize` is the single point of configuration entry — data and behaviour both
 * come from what it resolves, since it is called again on every remount and both need to see the same
 * thing at the same time.
 */
export interface IMemoryTaskGridDescriptorParams {
    /**
     * Resolves everything: the records, the metadata, the field mapping, the system views, the grid
     * parameters, the task strategy and the feature modules. Awaited before any strategy or data
     * provider is created, so the work is covered by the grid's loading state.
     *
     * Called again on every remount — same as `IDataverseTaskGridDescriptorParams.onInitialize` — so
     * this is not a one-shot seed. Anything that must survive a remount (a personal-views array, the
     * task records) is your own store: do the expensive/stateful part once behind a flag of your own,
     * and return its current value on every call, keeping it current through explicit write-backs (a
     * task strategy's `onDestroy`, a module provider's own events) rather than assuming this callback
     * only ever runs once.
     */
    onInitialize: () => Promise<IMemoryTaskGridDescriptorInitializeResult>;
    /**
     * Container height. Kept outside `onInitialize` because the skeleton needs it before the data
     * resolves.
     */
    height?: string;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} backed entirely by in-memory data — no Dataverse, no
 * network, no `Xrm.WebApi`. Intended for local development, tests, Storybook and demos.
 *
 * Wires up the task and saved-query strategies from a single parameter object.
 * `onInitialize` is the single point of configuration entry — the seed data, the task strategy and the
 * feature modules are all part of what it resolves, so they can be fetched, generated or lazily imported
 * while the grid shows its loading state, and so a strategy or module built from it always sees the
 * exact same data `onInitialize` just resolved.
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
 *       //features are opt-in: registering the module is what turns one on
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
    /**
     * Whatever the last `onLoadDependencies()` call resolved — refreshed on every remount, not a
     * persistence layer on its own. Anything that must survive a remount is the consumer's own store,
     * kept current through explicit write-backs rather than by this descriptor skipping re-execution.
     */
    private _initialized!: IMemoryTaskGridDescriptorInitializeResult;

    /** @param params — see {@link IMemoryTaskGridDescriptorParams}. */
    constructor(params: IMemoryTaskGridDescriptorParams) {
        this._params = params;
    }

    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    /**
     * The grid calls this again on every remount, and so does this method's own call to
     * `onInitialize()` — same as `DataverseTaskGridDescriptor`. Persistence across those calls is
     * `onInitialize`'s own job now, not something this method does for it.
     */
    public async onLoadDependencies(): Promise<void> {
        const initialized = await this._params.onInitialize();
        if (initialized.systemQueries.length === 0) {
            throw new Error('MemoryTaskGridDescriptor requires at least one system query.');
        }
        this._initialized = initialized;
    }

    //kept separate from onGetGridParameters because the skeleton needs it before the instance exists
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

    /**
     * Calls each builder on the `modules` resolved by `onInitialize`, per {@link IMemoryModules}. An
     * absent builder — which is what omitting the key does — leaves that feature off.
     */
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
     * `MemoryTaskStrategy` over the resolved records. Either way the strategy is handed the *same*
     * arrays a rebuilt one gets, so it sees everything its predecessor wrote.
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
