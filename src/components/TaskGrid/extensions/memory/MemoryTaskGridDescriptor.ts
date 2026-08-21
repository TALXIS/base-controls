import { IDataProvider, IMemoryProviderEntityMetadata, IRawRecord } from "@talxis/client-libraries";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskStrategyDeps } from "@components/TaskGrid/interfaces";
import { ITaskGridModules } from "@components/TaskGrid/modules/interfaces";
import { ICustomColumnsStrategy, ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, IUserQueryStrategy } from "@components/TaskGrid/providers";
import { IGridCustomizerStrategy } from "@components/TaskGrid/components/grid";
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

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IMemoryTaskStrategyContext extends IMemoryStrategyContext {
    /** The providers and flags the grid built. Forward them to the strategy's second argument. */
    deps: ITaskStrategyDeps;
}

/** What {@link IMemoryTaskGridDescriptorParams.onInitialize} resolves: the data the grid loads with. */
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
}

/**
 * Constructor parameters for {@link MemoryTaskGridDescriptor}: the required `onInitialize` hook, the
 * container height, and an optional hook per feature.
 *
 * Data comes from `onInitialize`; behaviour is passed here. What a feature hook returns decides whether
 * the feature exists at all — omit it and the feature is off, which is also what lets its code be
 * tree-shaken away.
 */
export interface IMemoryTaskGridDescriptorParams {
    /**
     * Resolves the records, the metadata, the field mapping, the system views and the grid parameters.
     * Awaited once, before any strategy or data provider is created, so the work is covered by the
     * grid's loading state.
     */
    onInitialize: () => Promise<IMemoryTaskGridDescriptorInitializeResult>;
    /**
     * Container height. Kept outside `onInitialize` because the skeleton needs it before the data
     * resolves.
     */
    height?: string;
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
     * (Optional) Supplies the feature modules, keyed by feature. Importing a module's create method is
     * what brings both its behaviour and its UI:
     *
     * ```ts
     * onGetModules: () => ({
     *     userQueries: createUserQueryModule({
     *         strategy: new MemoryUserQueryStrategy({ userQueries }),
     *         enableQueryManager: true,
     *     }),
     *     templates: createTemplateModule({
     *         provider: new MemoryTemplateDataProvider({ templates }),
     *     }),
     * })
     * ```
     *
     * Omit a key and that feature is off. This is a callback, called once per mount, so a strategy built
     * here sees whatever `onInitialize` resolved — which is also why anything that must survive a remount
     * (the `userQueries` array above) belongs to you, not to the strategy.
     */
    onGetModules?: (context: IMemoryStrategyContext) => ITaskGridModules;
    /**
     * (Optional) Supplies a custom-columns strategy. There is no in-memory implementation, so this is
     * the only way to switch user-defined columns on with this descriptor.
     */
    onCreateCustomColumnsStrategy?: (context: IMemoryStrategyContext) => ICustomColumnsStrategy | undefined;
    /**
     * (Optional) Supplies the candidates of a lookup-many picker. Which columns *render* as lookup-many
     * is driven by `metadata.LookupMany` on the column itself; this is what feeds them, and
     * {@link MemoryLookupManyDataProviderFactory} turns records you hold into the provider:
     *
     * ```ts
     * onCreateLookupManyDataProvider: ({ column }) => MemoryLookupManyDataProviderFactory.create(SOURCES[column.name]),
     * ```
     */
    onCreateLookupManyDataProvider?: (parameters: IMemoryLookupManyParameters) => IDataProvider | undefined;
    /**
     * (Optional) Supplies a strategy for deep customization of AG Grid column definitions, cell
     * renderers, editors and row class rules. Lookup-many columns are already handled natively, so this
     * is only needed for customizations of your own.
     */
    onCreateGridCustomizerStrategy?: () => IGridCustomizerStrategy | undefined;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} backed entirely by in-memory data — no Dataverse, no
 * network, no `Xrm.WebApi`. Intended for local development, tests, Storybook and demos.
 *
 * Wires up the task, saved-query and grid-customizer strategies from a single parameter object.
 * Dependencies — the seed data included — are resolved through `onInitialize`, so they can be
 * fetched, generated or lazily imported while the grid shows its loading state.
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
 *     };
 *   },
 *   //features are opt-in: registering the module is what turns one on
 *   onGetModules: () => ({ userQueries: createUserQueryModule({ strategy: new MemoryUserQueryStrategy({ userQueries }) }) }),
 * });
 * ```
 */
export class MemoryTaskGridDescriptor implements ITaskGridDescriptor {
    private _params: IMemoryTaskGridDescriptorParams;
    /**
     * Resolved once and then kept — this is the extension's persistence layer. The collections inside
     * it are mutated in place by the strategies, so everything the user does survives the remounts the
     * grid performs.
     */
    private _initialized?: IMemoryTaskGridDescriptorInitializeResult;

    /** @param params — see {@link IMemoryTaskGridDescriptorParams}. */
    constructor(params: IMemoryTaskGridDescriptorParams) {
        this._params = params;
    }

    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    /**
     * The grid calls this again on every remount. Resolving only once is what makes the descriptor a
     * persistence layer: re-running `onInitialize` would hand back fresh arrays and discard the session.
     */
    public async onLoadDependencies(): Promise<void> {
        if (this._initialized) {
            return;
        }
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
     * Delegates to the `onGetModules` parameter. An absent key — which is what omitting the parameter
     * does — leaves that feature off.
     */
    public onGetModules(): ITaskGridModules {
        return this._params.onGetModules?.(this._getStrategyContext()) ?? {};
    }

    /**
     * Delegates to the `onCreateTaskStrategy` parameter, falling back to a plain `MemoryTaskStrategy`
     * over the resolved records. Either way the strategy is handed the *same* arrays a rebuilt one gets,
     * so it sees everything its predecessor wrote.
     */
    public onCreateTaskStrategy(deps: ITaskStrategyDeps): ITaskDataProviderStrategy {
        const { records, metadata } = this._getData();
        return this._params.onCreateTaskStrategy?.({ ...this._getStrategyContext(), deps })
            ?? new MemoryTaskStrategy({
                onInitialize: async provider => ({ rawData: records, metadata, columns: provider.getColumns() }),
            }, deps);
    }

    /** Delegates to the `onCreateCustomColumnsStrategy` parameter. Custom columns are off without it. */
    public onCreateCustomColumnsStrategy(): ICustomColumnsStrategy | undefined {
        return this._params.onCreateCustomColumnsStrategy?.(this._getStrategyContext());
    }

    /** Delegates to the `onCreateLookupManyDataProvider` parameter. */
    public onCreateLookupManyDataProvider(parameters: ILookupManyDataProviderParameters): IDataProvider | undefined {
        return this._params.onCreateLookupManyDataProvider?.(parameters);
    }

    public onCreateGridCustomizerStrategy(): IGridCustomizerStrategy | undefined {
        return this._params.onCreateGridCustomizerStrategy?.();
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private _getStrategyContext(): IMemoryStrategyContext {
        const { records, metadata, systemQueries } = this._getData();
        return { records, metadata, systemQueries };
    }

    private _getData(): IMemoryTaskGridDescriptorInitializeResult {
        if (!this._initialized) {
            throw new Error('MemoryTaskGridDescriptor has not been initialized yet. The TaskGrid calls onLoadDependencies before any other hook.');
        }
        return this._initialized;
    }
}
