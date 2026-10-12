import { FetchXmlBuilder, ISingleRecord, RecordBuilder } from "@talxis/client-libraries";
import { ISavedQuery, ISavedQueryStrategy, ITaskDataProviderStrategy } from "@controls/task-grid/providers";
import { IFieldMapping, ILookupManyDataProviderParameters, ITaskGridDescriptor, ITaskGridParameters, ITaskGridFactoryParams } from "@controls/task-grid/interfaces";
import { ITaskGridServiceLocator } from "@controls/task-grid/services";
import { DataverseTaskStrategy } from "@controls/task-grid/strategies/dataverse/DataverseTaskStrategy";
import { EntityDefinition } from "@talxis/client-metadata";


/** Dataverse-specific field mapping. Extends the base with an optional project lookup column. */
export interface IDataverseFieldMapping extends Omit<IFieldMapping, 'stateCode'> {
    /**
     * Logical name of the lookup attribute that points to the parent project record. Required for a new
     * task to be linked to the project the project module resolved.
     */
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

/** What the descriptor hands a consumer-supplied task strategy. */
export interface IDataverseTaskStrategyContext extends IDataverseStrategyContext {
    /** Everything the grid built. Forward it to the strategy's second argument. */
    services: ITaskGridServiceLocator;
    /** The `baseFetchXml` from `onInitialize`. The strategy renders its Liquid variables itself. */
    fetchXml: string;
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
    /**
     * The project these tasks belong to. Hydrated here and read back through `getStrategyContext` —
     * register the project module over it (`DataverseProjectStrategy`) for the task query's
     * `{{ project.* }}` and the link every new task gets.
     */
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
}

export interface IDataverseTaskGridDescriptorParams {
    /**
     * Resolves everything: the FetchXML, the field mapping, the system views, the records the query is
     * scoped by and the task strategy. Awaited once per mount, before any strategy or data provider is
     * created, so the work is covered by the grid's loading state.
     */
    onInitialize: () => Promise<IDataverseTaskGridDescriptorInitializeResult>;
}

/**
 * Ready-to-use {@link ITaskGridDescriptor} implementation for the Dataverse / Talxis platform.
 *
 * `onInitialize` is the single point of configuration entry: the data and the task strategy are what it
 * resolves. The features go on `TaskGrid` itself, and their strategies read what this resolved through {@link DataverseTaskGridDescriptor.getStrategyContext}.
 *
 * @example
 * ```ts
 * const descriptor = new DataverseTaskGridDescriptor({
 *   onInitialize: async () => ({
 *     baseFetchXml: myFetchXml,
 *     fieldMapping: { parentId: 'talxis_parenttaskid', subject: 'subject', stackRank: 'talxis_stackrank' },
 *     systemQueries: [myDefaultView],
 *   }),
 * });
 * <TaskGrid descriptor={descriptor} height='600px' features={{
 *   userQueries: createUserQueryModule({
 *     onCreateStrategy: () => new TalxisUserQueryStrategy({ entityName: descriptor.getStrategyContext().entityName }),
 *   }),
 * }} />
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
     * Delegates to the `onCreateTaskStrategy` resolved by `onInitialize`, falling back to a plain
     * `DataverseTaskStrategy` over the resolved FetchXML.
     */
    public onCreateTaskStrategy({ services }: ITaskGridFactoryParams): ITaskDataProviderStrategy {
        const context: IDataverseTaskStrategyContext = {
            ...this.getStrategyContext(),
            services: services,
            fetchXml: this._fetchXml,
            sourceRecord: this._sourceRecord,
        };
        return this._initialized.onCreateTaskStrategy?.(context) ?? new DataverseTaskStrategy({
            onInitialize: async () => ({
                fetchXml: this._fetchXml,
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

    /** What `onInitialize` resolved, for the strategies of the feature modules; read once the grid loads. */
    public getStrategyContext(): IDataverseStrategyContext {
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