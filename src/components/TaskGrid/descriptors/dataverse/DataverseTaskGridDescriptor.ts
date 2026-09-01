import { FetchXmlBuilder, ISingleRecord, RecordBuilder } from "@talxis/client-libraries";
import { ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy, IUserQueryStrategy } from "@components/TaskGrid/providers";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskGridFactoryParams } from "@components/TaskGrid/interfaces";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";
import { IChecklistModule, IGanttModule, IProjectModule, ICustomColumnsModule, IDependenciesModule, IGridCustomizerModule, ILookupManyModule, ITaskGridModules, ITemplateModule, IUserQueryModule } from "@components/TaskGrid/modules/interfaces";
import { DataverseTaskStrategy } from "@components/TaskGrid/strategies/dataverse/DataverseTaskStrategy";
import { EntityDefinition } from "@talxis/client-metadata";


/** Dataverse-specific field mapping. Extends the base with an optional project lookup column. */
export interface IDataverseFieldMapping extends Omit<IFieldMapping, 'stateCode'> {
    /** Logical name of the lookup attribute that points to the parent project record. Required when `projectRecord` is set on the descriptor. */
    projectId?: string;
}

/** Lightweight entity reference shape used when only logical name + id are available. */
export interface IEntityRecordReference {
    entityName: string;
    id: string;
}

/** Input accepted for source/project: either a fully hydrated record or an entity reference. */
export type RecordInput = IEntityRecordReference | ISingleRecord;

const isSingleRecord = (record: RecordInput | undefined): record is ISingleRecord => {
    return !!record && typeof (record as ISingleRecord).getRecordId === "function";
};

/** What the descriptor has resolved by the time it builds an optional strategy. */
export interface IDataverseStrategyContext {
    /** Logical name of the task entity, derived from `baseFetchXml`. */
    entityName: string;
    /** Id of the project record, when one was supplied. */
    recordId?: string;
    /** Id of the current user, from `userId`. */
    userId?: string;
    /** The system views supplied through `systemQueries`. */
    systemQueries: ISavedQuery[];
    /** The hydrated project record, when `projectRecord` was supplied. */
    projectRecord?: ISingleRecord;
    /** The hydrated source record, when `sourceRecord` was supplied. */
    sourceRecord?: ISingleRecord;
}

/**
 * What the descriptor hands the lookup-many callback: the cell the picker belongs to, plus the two records
 * its query can be scoped by. Pass the whole thing to `DataverseLookupManyDataProviderFactory`.
 */
export interface IDataverseLookupManyParameters extends ILookupManyDataProviderParameters {
    /** The hydrated project record, when `projectRecord` was supplied. Reaches the query as `{{ project.* }}`. */
    projectRecord?: ISingleRecord;
    /** The hydrated source record, when `sourceRecord` was supplied. Reaches the query as `{{ currentRecord.* }}`. */
    sourceRecord?: ISingleRecord;
}

/** What {@link IDataverseModules.onGetUserQueriesModule} is called with. */
export type IDataverseUserQueriesParams = Pick<IDataverseStrategyContext, 'entityName' | 'recordId' | 'userId'> & ITaskGridFactoryParams;

/** What {@link IDataverseModules.onGetCustomColumnsModule} is called with. */
export type IDataverseCustomColumnsParams = Pick<IDataverseStrategyContext, 'entityName' | 'recordId'> & ITaskGridFactoryParams;

/** What {@link IDataverseModules.onGetLookupManyModule} is called with. */
export type IDataverseLookupManyParams = Pick<IDataverseStrategyContext, 'projectRecord' | 'sourceRecord'> & ITaskGridFactoryParams;

/**
 * The feature modules a Dataverse grid can run with, one builder per feature. Omit a key and that feature
 * is off.
 *
 * Each builder is called with one object: the slice of descriptor context its own strategy reads, plus
 * the grid's service locator. Pass `services` on to whatever the builder constructs.
 */
export interface IDataverseModules {
    /**
     * Personal views: *My views*, the save commands and the view manager. Needs the `talxis_userquery`
     * table.
     *
     * ```ts
     * onGetUserQueriesModule: ({ services, entityName }) => createUserQueryModule({
     *     strategy: new TalxisUserQueryStrategy({
     *         entityName: context.entityName,
     *         recordId: context.recordId,
     *         ownerId: context.userId,
     *     }),
     * })
     * ```
     */
    onGetUserQueriesModule?: (params: IDataverseUserQueriesParams) => IUserQueryModule | undefined;
    /**
     * Task templates. `createTemplateModule({ provider })` — no Dataverse template provider ships, so the
     * provider is your own. Hand it the `services` this builder receives; that is how it reaches the task
     * side it reads from.
     */
    onGetTemplatesModule?: (params: ITaskGridFactoryParams) => ITemplateModule | undefined;
    /**
     * User-defined columns. Needs the `talxis_attributedefinition` and `talxis_attributevalue` tables.
     *
     * ```ts
     * onGetCustomColumnsModule: ({ services, entityName }) => createCustomColumnsModule({
     *     strategy: new TalxisCustomColumnsStrategy({
     *         entityName: context.entityName,
     *         recordId: context.recordId,
     *     }),
     * })
     * ```
     */
    onGetCustomColumnsModule?: (params: IDataverseCustomColumnsParams) => ICustomColumnsModule | undefined;
    /**
     * AG Grid customization: column definitions and row class rules. The strategy is your own, and takes
     * the locator like every other. See [**Customizer**](?path=/story/task-grid-customizations-customizer--overview).
     *
     * ```ts
     * onGetGridCustomizerModule: ({ services }) => createGridCustomizerModule({
     *     strategy: new MyGridCustomizerStrategy({ services }),
     * })
     * ```
     */
    onGetGridCustomizerModule?: (params: ITaskGridFactoryParams) => IGridCustomizerModule | undefined;
    /**
     * Candidate records for lookup-many columns. `DataverseLookupManyDataProviderFactory` builds the
     * provider from the column's own `FetchXml` binding, scoped by the two records on the context.
     *
     * Which columns render as lookup-many is driven by `metadata.LookupMany` on the column itself.
     *
     * ```ts
     * onGetLookupManyModule: ({ services, projectRecord }) => createLookupManyModule({
     *     createDataProvider: (parameters) => DataverseLookupManyDataProviderFactory.create({
     *         ...parameters,
     *         projectRecord: context.projectRecord,
     *         sourceRecord: context.sourceRecord,
     *     }),
     * })
     * ```
     */
    onGetLookupManyModule?: (params: IDataverseLookupManyParams) => ILookupManyModule | undefined;
    /**
     * Task dependencies.
     *
     * ```ts
     * onGetDependenciesModule: ({ services }) => createDependenciesModule({
     *     strategy: new DataverseTaskDependencyStrategy({
     *         entityName: 'talxis_taskdependency',
     *         primaryIdAttribute: 'talxis_taskdependencyid',
     *         predecessorAttribute: 'talxis_predecessortaskid',
     *         successorAttribute: 'talxis_successortaskid',
     *         typeAttribute: 'talxis_dependencytypecode',
     *         dependencyTypeCodes: { 742070000: 'finishToStart' },
     *     }),
     *     services,
     * })
     * ```
     *
     * The strategy assumes no schema — the table, its attributes and its option set are all yours to
     * name. Registering the module is what creates the predecessors and successors columns.
     */
    onGetDependenciesModule?: (params: ITaskGridFactoryParams) => IDependenciesModule | undefined;
    /**
     * Task checklists. No Dataverse checklist strategy ships, so the strategy is your own — anything
     * satisfying `IChecklistStrategy`.
     *
     * Registering it is what creates the grid's checklist column.
     */
    onGetChecklistModule?: (params: ITaskGridFactoryParams) => IChecklistModule | undefined;
    /**
     * The Gantt: a timeline beside the grid.
     *
     * ```ts
     * onGetGanttModule: ({ services }) => createGanttModule({
     *     fieldMapping: { startDate: 'scheduledstart', endDate: 'scheduledend' },
     *     services,
     * })
     * ```
     *
     * Registering it is what replaces the plain grid with the split view.
     */
    onGetGanttModule?: (params: ITaskGridFactoryParams) => IGanttModule | undefined;
    /**
     * The project the tasks belong to. Only the Gantt reads it today — registering it is what draws its
     * project start and end markers.
     */
    onGetProjectModule?: (params: ITaskGridFactoryParams) => IProjectModule | undefined;
}

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IDataverseTaskStrategyContext extends IDataverseStrategyContext {
    /** Everything the grid built. Forward it to the strategy's second argument. */
    services: ITaskGridServiceLocator;
    /** The `baseFetchXml` from `onInitialize`. The strategy renders its Liquid variables itself. */
    fetchXml: string;
    /** The hydrated project record, when `projectRecord` was supplied. */
    projectRecord?: ISingleRecord;
    /** The hydrated source record, when `sourceRecord` was supplied. */
    sourceRecord?: ISingleRecord;
}

/** What {@link IDataverseTaskGridDescriptorParams.onInitialize} resolves. */
export interface IDataverseTaskGridDescriptorInitializeResult {
    /** FetchXML that drives the initial data load. May use the Liquid template variables. */
    baseFetchXml: string;
    /** Maps logical entity attribute names to the roles expected by TaskGrid (e.g. `statecode` → `stateCode`). */
    fieldMapping: IDataverseFieldMapping;
    /** System (non-deletable) views exposed in the view switcher. At least one is required, and their columns are the grid's column catalogue. */
    systemQueries: ISavedQuery[];
    /** The project these tasks belong to. Injected into Liquid templates and pre-filled on create. */
    projectRecord?: RecordInput;
    /** An additional record exposed to Liquid templates. Its data is propagated into the FetchXML. */
    sourceRecord?: RecordInput;
    /** ID of the currently logged-in user. Pass it on to the user-query strategy to scope personal views. */
    userId?: string;
    /** Feature flags forwarded to the grid. See {@link ITaskGridParameters}. */
    gridParameters?: ITaskGridParameters;
    /**
     * Supplies the task strategy, and with it every task-level option: the form ids, the delete
     * behaviour, the root task. Omit it and the descriptor builds a plain `DataverseTaskStrategy` over
     * the resolved FetchXML.
     */
    onCreateTaskStrategy?: (context: IDataverseTaskStrategyContext) => ITaskDataProviderStrategy;
    /** The feature modules this grid runs with, one builder per feature. See {@link IDataverseModules}. */
    modules?: IDataverseModules;
}

/** Constructor parameters for {@link DataverseTaskGridDescriptor}. */
export interface IDataverseTaskGridDescriptorParams {
    /**
     * Resolves everything: the FetchXML, the field mapping, the system views, the records the query is
     * scoped by, the task strategy and the feature modules. Awaited before any strategy or data provider
     * is created, so the work is covered by the grid's loading state.
     *
     * Called again on every remount — and the grid remounts when a view changes or a record is saved —
     * so re-fetching here should be idempotent and cheap.
     */
    onInitialize: () => Promise<IDataverseTaskGridDescriptorInitializeResult>;
    /** Container height. Read synchronously, before `onInitialize` resolves, for the loading skeleton. */
    height?: string;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} implementation for the Dataverse / Talxis platform.
 *
 * `onInitialize` is the single point of configuration entry: the data, the task strategy and the feature
 * modules are all part of what it resolves. `height` is the only other constructor parameter.
 *
 * @example
 * ```ts
 * const descriptor = new DataverseTaskGridDescriptor({
 *   height: '600px',
 *   onInitialize: async () => ({
 *     baseFetchXml: myFetchXml,
 *     fieldMapping: { parentId: 'talxis_parenttaskid', subject: 'subject', stackRank: 'talxis_stackrank' },
 *     systemQueries: [myDefaultView],
 *     modules: {
 *       onGetUserQueriesModule: ({ services, entityName }) => createUserQueryModule({ strategy: new TalxisUserQueryStrategy({ entityName: context.entityName }) }),
 *     },
 *   }),
 * });
 * const control = await TaskGridDatasetControlFactory.createInstance({ taskGridDescriptor: descriptor, ... });
 * ```
 */
export class DataverseTaskGridDescriptor implements ITaskGridDescriptor {
    private _params: IDataverseTaskGridDescriptorParams;
    private _initialized!: IDataverseTaskGridDescriptorInitializeResult;
    private _fetchXml!: string;
    private _systemQueries: ISavedQuery[] = [];
    private _taskEntityName!: string;
    private _projectRecord?: ISingleRecord;
    private _sourceRecord?: ISingleRecord;

    constructor(params: IDataverseTaskGridDescriptorParams) {
        this._params = params;
    }

    // ── ITaskGridDescriptor ──────────────────────────────────────────────────

    /** Resolves `onInitialize`, then hydrates the project and source records it named. */
    public async onLoadDependencies(): Promise<void> {
        const initialized = await this._params.onInitialize();
        this._initialized = initialized;
        this._systemQueries = initialized.systemQueries;
        this._fetchXml = initialized.baseFetchXml;
        this._taskEntityName = this._getTaskEntityNameFromFetchXml(initialized.baseFetchXml);
        this._projectRecord = await this._getProjectRecord();
        this._sourceRecord = await this._getSourceRecord();
    }

    public onGetHeight(): string | undefined {
        return this._params.height;
    }

    /** Returns the field mapping with `stateCode` hard-coded to `"statecode"` (standard Dataverse attribute name). */
    public onGetFieldMapping(): IFieldMapping {
        return {
            ...this._initialized.fieldMapping,
            //dataverse uses this for all entities
            stateCode: 'statecode',
        }
    }

    /** Returns the feature flags `onInitialize` resolved, or an empty object — every flag then defaults to `false`. */
    public onGetGridParameters(): ITaskGridParameters {
        return this._initialized.gridParameters ?? {};
    }

    /**
     * Serves the `systemQueries` `onInitialize` resolved. Personal views come from the user-queries
     * module instead — without it they are off and `talxis_userquery` is never read.
     */
    public onCreateSavedQueryStrategy(): ISavedQueryStrategy {
        return {
            onGetSystemQueries: async () => this._systemQueries,
        };
    }

    /**
     * Calls each builder on the `modules` resolved by `onInitialize`, each with the slice of context it
     * declares. An absent builder leaves that feature off.
     */
    public onGetModules({ services }: ITaskGridFactoryParams): ITaskGridModules {
        //one object per builder: its context slice plus the locator. The declared types narrow the
        //context to what each one reads, so a builder only sees the keys it was promised
        const params = { ...this._getStrategyContext(), services };
        const modules = this._initialized.modules;
        return {
            userQueries: modules?.onGetUserQueriesModule?.(params),
            templates: modules?.onGetTemplatesModule?.(params),
            customColumns: modules?.onGetCustomColumnsModule?.(params),
            gridCustomizer: modules?.onGetGridCustomizerModule?.(params),
            lookupMany: modules?.onGetLookupManyModule?.(params),
            dependencies: modules?.onGetDependenciesModule?.(params),
            checklist: modules?.onGetChecklistModule?.(params),
            gantt: modules?.onGetGanttModule?.(params),
            project: modules?.onGetProjectModule?.(params),
        };
    }

    /**
     * Delegates to the `onCreateTaskStrategy` resolved by `onInitialize`, falling back to a plain
     * `DataverseTaskStrategy` over the resolved FetchXML.
     */
    public onCreateTaskStrategy({ services }: ITaskGridFactoryParams): ITaskDataProviderStrategy {
        const context: IDataverseTaskStrategyContext = {
            ...this._getStrategyContext(),
            services: services,
            fetchXml: this._fetchXml,
            projectRecord: this._projectRecord,
            sourceRecord: this._sourceRecord,
        };
        return this._initialized.onCreateTaskStrategy?.(context) ?? new DataverseTaskStrategy({
            onInitialize: async () => ({
                fetchXml: this._fetchXml,
                projectRecord: this._projectRecord,
                sourceRecord: this._sourceRecord,
            }),
            services: services,
        });
    }

    private async _getProjectRecord(): Promise<ISingleRecord | undefined> {
        const projectRecord = this._initialized.projectRecord;
        if (!projectRecord) return undefined;
        if (isSingleRecord(projectRecord)) {
            return projectRecord;
        }

        const projectId = projectRecord.id;
        const projectEntityName = projectRecord.entityName;
        const metadata = await EntityDefinition.fromEntityName(projectEntityName);
        //@ts-ignore - typings
        const attributes = (await window.Xrm.Utility.getEntityMetadata(projectEntityName, metadata.Attributes.map(attr => attr.LogicalName))).Attributes.get().filter(attr => attr.IsValidForGrid);
        const projectData = await window.Xrm.WebApi.retrieveRecord(projectEntityName, projectId, `?$select=${metadata.PrimaryNameAttribute}`);
        const builder = new RecordBuilder({
            data: projectData,
            entityMetadata: metadata,
            attributes: attributes
        });
        return builder.getRecord();
    }

    private async _getSourceRecord(): Promise<ISingleRecord | undefined> {
        const sourceRecord = this._initialized.sourceRecord;
        if (!sourceRecord) {
            return undefined;
        }
        const sourceRecordId = isSingleRecord(sourceRecord) ? sourceRecord.getRecordId() : sourceRecord.id;
        if (this._projectRecord && this._projectRecord.getRecordId() === sourceRecordId) {
            return this._projectRecord;
        }

        if (isSingleRecord(sourceRecord)) {
            return sourceRecord;
        }
        const result = await window.Xrm.WebApi.retrieveRecord(sourceRecord.entityName, sourceRecord.id);
        const entityMetadata = await EntityDefinition.fromEntityName(sourceRecord.entityName);
        //@ts-ignore - typings
        const attributes = (await window.Xrm.Utility.getEntityMetadata(sourceRecord.entityName, entityMetadata.Attributes.map(attr => attr.LogicalName))).Attributes.get().filter(attr => attr.IsValidForGrid);

        const builder = new RecordBuilder({
            data: result,
            entityMetadata: entityMetadata,
            attributes: attributes
        });

        return builder.getRecord();
    }

    // ── Internals ────────────────────────────────────────────────────────────

    private _getStrategyContext(): IDataverseStrategyContext {
        return {
            entityName: this._taskEntityName,
            recordId: this._projectRecord?.getRecordId(),
            userId: this._initialized.userId,
            systemQueries: this._systemQueries,
            projectRecord: this._projectRecord,
            sourceRecord: this._sourceRecord,
        };
    }

    private _getTaskEntityNameFromFetchXml(fetchXml: string): string {
        const fetchXmlBuilder = FetchXmlBuilder.fetch.fromXml(fetchXml);
        return fetchXmlBuilder.entity.name;
    }

}