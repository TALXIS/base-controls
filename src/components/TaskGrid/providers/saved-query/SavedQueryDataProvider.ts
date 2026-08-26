import { DataTypes, IColumn } from "@talxis/client-libraries";
import { ICustomColumnsDataProvider } from "@components/TaskGrid/modules/custom-columns/CustomColumnsDataProvider";
import { INativeColumns } from "@components/TaskGrid/interfaces";
import { ILocalizationService } from "@utils";
import { ITaskGridLabels } from "@components/TaskGrid/labels";
import { IUserQueryDataProvider } from "@components/TaskGrid/modules/interfaces";
import { ITaskGridServiceLocator } from "@components/TaskGrid/services";


/** Per-view outcome of deleting personal views. */
export type IDeletedUserQueriesResult = { success: true; deletedQueryIds: string[] } | { success: false; deletedQueryIds: string[]; errors: { queryId: string; error: any }[] };


/** A view: its identity, plus the columns, sorting and filtering it applies. */
export interface ISavedQuery extends ISavedQueryMetadata {
    id: string;
    /** Shown in the view switcher. */
    name: string;
    description?: string;
}

/** What a view applies to the grid. */
export interface ISavedQueryMetadata {
    /** The columns to show, in order. Also the grid's column catalogue when the view is a system one. */
    columns: IColumn[]
    sorting?: ComponentFramework.PropertyHelper.DataSetApi.SortStatus[];
    filtering?: ComponentFramework.PropertyHelper.DataSetApi.FilterExpression;
    linking?: ComponentFramework.PropertyHelper.DataSetApi.LinkEntityExposedExpression[];
    /** Opens the view as a flat list instead of a tree. */
    isFlatListEnabled?: boolean;
    searchQuery?: string | undefined;
    /** The columns quick find searches. */
    quickFindColumns?: string[];
}

/** Name of the virtual column holding each task's root-to-self path. */
export const PATH_COLUMN_NAME = 'path__virtual';
/** Name of the virtual column showing what a task waits on. Only exists with the dependencies module. */
export const PREDECESSORS_COLUMN_NAME = 'predecessors__virtual';
/** Name of the virtual column showing what waits on a task. Only exists with the dependencies module. */
export const SUCCESSORS_COLUMN_NAME = 'successors__virtual';
/** Name of the virtual column showing a task's checklist. Only exists with the checklist module. */
export const CHECKLIST_COLUMN_NAME = 'checklist__virtual';
const REQUIRED_COLUMNS = ['subject', 'parentId', 'stackRank', 'stateCode'];

/**
 * The personal-views half of {@link ISavedQueryStrategy}. Supplying one is what enables the
 * user-queries feature — there is no separate flag.
 */
export interface IUserQueryStrategy {
    /** Returns views saved by the current user. */
    onGetUserQueries: () => Promise<ISavedQuery[]>;
    /** Whether the given query id is one of the user's own views, as opposed to a system view. */
    onIsUserQuery: (queryId: string) => boolean;
    /** Deletes the specified user views. Returns a per-query success/failure result. */
    onDeleteUserQueries: (queryIds: string[]) => Promise<IDeletedUserQueriesResult>;
    /** @returns The updated query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onUpdateUserQuery: (currentQuery: ISavedQuery) => Promise<string | null>;
    /** @returns The created query id, or `null` if the operation was cancelled by the user. Throws on unexpected failure. */
    onCreateUserQuery: (newQuery: { name: string; description?: string }, currentQuery: ISavedQuery) => Promise<string | null>;
}

/** Strategy interface for loading the system (non-deletable) saved views. */
export interface ISavedQueryStrategy {
    /** Returns the built-in (non-deletable) views. At least one system query must be returned. */
    onGetSystemQueries: () => Promise<ISavedQuery[]>;
}

/** Serves the system views, tracks which view is active, and normalises every view's columns. */
export interface ISavedQueryDataProvider {
    /** Returns the full list of non-deletable system views. */
    getSystemQueries: () => ISavedQuery[];
    /**
     * Returns the user's personal views, or `[]` when no user-queries module is registered. Read from the
     * module's provider, so it never holds a second copy of the list.
     */
    getUserQueries: () => ISavedQuery[];
    /** Returns the currently active saved query. Throws if `refresh` has not been called yet. */
    getCurrentQuery: () => ISavedQuery;
    /** Looks up a query by id across system and user queries. Throws if not found. */
    getSavedQuery(id: string): ISavedQuery;
    /** Fetches system and user queries and sets the initial active query. */
    refresh: () => Promise<void>;
    /** Releases the resources held by the provider. */
    destroy: () => void;
}

export interface ISavedQueryDataProviderParameters {
    /** Where the system views come from. */
    strategy: ISavedQueryStrategy;
    /** Where the column names, the labels and the optional module providers are reached. */
    services: ITaskGridServiceLocator;
    preferredQuery?: Partial<ISavedQuery> & { id: string };
}

/**
 * Serves the grid's views: the system ones from the descriptor's strategy, and the user's own from the
 * user-queries module when it is registered.
 */
export class SavedQueryDataProvider implements ISavedQueryDataProvider {
    private _strategy: ISavedQueryStrategy
    private _services: ITaskGridServiceLocator;
    private _systemQueries: ISavedQuery[] = [];
    private _currentQuery?: ISavedQuery;
    private _systemQueriesColumnsMap: Map<string, IColumn> = new Map();
    private _preferredQuery?: Partial<ISavedQuery> & { id: string };

    constructor(parameters: ISavedQueryDataProviderParameters) {
        this._strategy = parameters.strategy;
        this._services = parameters.services;
        this._preferredQuery = parameters.preferredQuery;
    }

    /**
     * The personal-views provider, from the user-queries module. Absent means the feature is off: no
     * *My views*, no save commands and no view manager.
     */
    private get _userQueryProvider(): IUserQueryDataProvider | undefined {
        return this._services.find('userQueriesModule')?.provider;
    }

    /** The user-defined columns, when the custom-columns module is registered. */
    private get _customColumnsDataProvider(): ICustomColumnsDataProvider | undefined {
        return this._services.find('customColumnsModule')?.provider;
    }

    private get _nativeColumns(): INativeColumns {
        return this._services.get('nativeColumns');
    }

    private get _localizationService(): ILocalizationService<ITaskGridLabels> {
        return this._services.get('localizationService');
    }

    public getSystemQueries(): ISavedQuery[] {
        return this._systemQueries;
    }

    public getUserQueries(): ISavedQuery[] {
        return this._userQueryProvider?.getQueries() ?? [];
    }

    public getCurrentQuery(): ISavedQuery {
        if (!this._currentQuery) {
            throw new Error('Current query is not set. Make sure to call refresh() and wait for it to complete before accessing the current query.');
        }
        return this._currentQuery;
    }

    public getSavedQuery(id: string): ISavedQuery {
        const query = [...this._systemQueries, ...this.getUserQueries()].find(q => q.id === id);
        if (!query) {
            throw new Error(`Query with id ${id} not found. Make sure to call refresh() and wait for it to complete before accessing the saved query.`);
        }
        return query;
    }

    public async destroy() {
        //the module's provider owns its own listeners and is destroyed with it
    }

    public async refresh() {
        const systemQueries = await this._strategy.onGetSystemQueries();
        const userQueries = await this._userQueryProvider?.refresh() ?? [];
        if (systemQueries.length === 0) {
            throw new Error('At least one system query is required');
        }
        this._includePathColumn(systemQueries[0].columns);
        this._includeDependencyColumns(systemQueries[0].columns);
        this._includeChecklistColumn(systemQueries[0].columns);
        const allQueries = [...systemQueries, ...userQueries];
        this._systemQueries = systemQueries;

        const systemQueryColumnEntries = systemQueries.flatMap(
            query => query.columns.map(col => [col.name, col] as [string, IColumn])
        );
        const customColumnEntries = this._customColumnsDataProvider
            ? this._customColumnsDataProvider.getColumns().map(col => [col.name, col] as [string, IColumn])
            : [];

        this._systemQueriesColumnsMap = new Map<string, IColumn>([
            ...systemQueryColumnEntries,
            ...customColumnEntries
        ]);

        const preferredQueryInAllQueries = allQueries.find(q => q.id === this._preferredQuery?.id);
        this._currentQuery = preferredQueryInAllQueries ?? userQueries[0] ?? systemQueries[0];
        //preferred query might have some required columns missing
        this._currentQuery = this._processQueries([{
            ...this._currentQuery,
            ...(preferredQueryInAllQueries ? this._preferredQuery : {}),
        }])[0];
    }

    private _processQueries(queries: ISavedQuery[]) {
        return queries.map(query => {
            this._includeRequiredColumns(query.columns);
            this._harmonizeColumns(query.columns);
            return {
                ...query,
                ...this._parseSavedQueryMetadata(query)
            }
        })
    }

    private _includeRequiredColumns(columns: IColumn[]) {
        const allQueries = [...this.getSystemQueries(), ...this.getUserQueries()];
        const allQueryColumns = [...new Map(allQueries.flatMap(query => query.columns.map(col => [col.name, col]))).values()];
        for (const requiredColumnName of REQUIRED_COLUMNS) {
            const mappedRequiredColumnName = this._nativeColumns[requiredColumnName as keyof INativeColumns];
            if (!columns.find(col => col.name === mappedRequiredColumnName)) {
                const columnFromQueries = allQueryColumns.find(col => col.name === mappedRequiredColumnName);
                if (!columnFromQueries) {
                    throw new Error(`Required column ${mappedRequiredColumnName} is missing from both current query and all available queries`);
                }
                columns.push({
                    ...columnFromQueries,
                    isHidden: true
                });
            }
        }
        this._includePathColumn(columns);
    }

    private _harmonizeColumns(columns: IColumn[]) {
        for (const column of columns) {
            switch (column.name) {
                case this._nativeColumns.subject: {
                    column.isHidden = false;
                    break;
                }
                case this._nativeColumns.path: {
                    column.metadata = {
                        ...column.metadata,
                        IsValidForUpdate: false
                    }
                    break;
                }
                case CHECKLIST_COLUMN_NAME:
                case PREDECESSORS_COLUMN_NAME:
                case SUCCESSORS_COLUMN_NAME: {
                    //enforced on every declaration of these columns, the grid's own and a consumer's
                    //alike: the cell reads the dependencies module, not a value on the task, so there is
                    //nothing here to write, sort or filter by
                    column.disableSorting = true;
                    column.metadata = {
                        ...column.metadata,
                        IsValidForUpdate: false,
                        SupportedFilterConditionOperators: []
                    }
                    break;
                }
            }
        }
    }

    private _includePathColumn(columns: IColumn[]) {
        if (!columns.find(col => col.name === PATH_COLUMN_NAME)) {
            columns.push({
                name: PATH_COLUMN_NAME,
                dataType: DataTypes.Multiple,
                displayName: this._localizationService.getLocalizedString('path'),
                isVirtual: true,
                visualSizeFactor: 300,
                isHidden: true
            })
        }
        return columns;
    }

    /**
     * Adds the two dependency columns to the grid's column catalogue, so *Edit columns* offers each of
     * them. Registering the module is what makes them exist at all; a consumer that declared one in a view
     * of their own keeps it exactly as they wrote it.
     */
    private _includeDependencyColumns(columns: IColumn[]) {
        if (!this._services.find('dependenciesModule')) {
            return columns;
        }
        this._includeVirtualColumn(columns, PREDECESSORS_COLUMN_NAME, 'predecessors');
        this._includeVirtualColumn(columns, SUCCESSORS_COLUMN_NAME, 'successors');
        return columns;
    }

    /**
     * Adds the checklist column to the grid's column catalogue, so *Edit columns* offers it. Registering
     * the module is what makes it exist at all; a consumer that declared it in a view of their own keeps it
     * exactly as they wrote it.
     */
    private _includeChecklistColumn(columns: IColumn[]) {
        if (!this._services.find('checklistModule')) {
            return columns;
        }
        return this._includeVirtualColumn(columns, CHECKLIST_COLUMN_NAME, 'checklist');
    }

    /**
     * Adds one module-owned column to the catalogue, hidden: the columns are offered in *Edit columns*, so
     * a grid never shows one uninvited — and for dependencies, either direction can be taken on its own.
     */
    private _includeVirtualColumn(columns: IColumn[], name: string, labelKey: keyof ITaskGridLabels) {
        if (!columns.find(col => col.name === name)) {
            columns.push({
                name: name,
                dataType: DataTypes.SingleLineText,
                displayName: this._localizationService.getLocalizedString(labelKey),
                isVirtual: true,
                visualSizeFactor: 200,
                isHidden: true
            })
        }
        return columns;
    }

    private _parseSavedQueryMetadata(metadata: ISavedQueryMetadata): ISavedQueryMetadata {
        const parsed = metadata;

        let columns = parsed.columns.map(col => {
            const systemCol = this._systemQueriesColumnsMap.get(col.name);
            return systemCol ? { ...systemCol, ...col, metadata: { ...systemCol.metadata, ...col.metadata } } : col;
        });

        return { ...parsed, columns };
    }
}