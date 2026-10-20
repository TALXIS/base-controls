import { Attribute, DataTypes, EventEmitter, IAvailableRelatedColumn, IColumn, IDataProvider, IEventEmitter, ILinkEntityExposedExpression } from "@talxis/client-libraries";

export interface IDatasetControlEditColumnsSessionEvents {
    onColumnsChanged: () => void;
    onColumnAdded: (column: IColumn) => void;
    onScopeChanged: () => void;
    /** A column or scope load threw; `getError()` holds what. */
    onLoadFailed: () => void;
    /** The related entities the provider offers are known. */
    onScopesLoaded: () => void;
}

export interface IDatasetControlEditColumnsSessionParameters {
    provider: IDataProvider;
}


/** An edit of the columns that reaches the provider only when saved. */
export class DatasetControlEditColumnsSession {
    public readonly events: IEventEmitter<IDatasetControlEditColumnsSessionEvents> = new EventEmitter<IDatasetControlEditColumnsSessionEvents>();
    private _provider: IDataProvider;
    private _columns: IColumn[];
    //keyed by the related entity's id attribute and the lookup it is reached through
    private _linking: Map<string, ILinkEntityExposedExpression>;
    private _scope?: IAvailableRelatedColumn;
    private _relatedScopes: IAvailableRelatedColumn[] = [];
    private _error?: unknown;

    constructor(parameters: IDatasetControlEditColumnsSessionParameters) {
        this._provider = parameters.provider;
        this._columns = this._provider.getColumns().map(column => ({ ...column }));
        this._linking = new Map(this._provider.getLinking().map(link => [`${link.from}_${link.to}`, link]));
        this._loadRelatedScopes();
    }

    /** The visible columns, in order; hidden ones are kept and saved untouched. */
    public getColumns(): IColumn[] {
        return this._columns.filter(column => !column.isHidden);
    }

    public getEntityDisplayName(): string | undefined {
        return this._provider.getMetadata()?.DisplayCollectionName;
    }

    /** The columns of the current scope; `[]` when the load threw. */
    public async getAvailableColumns(query?: string): Promise<IColumn[]> {
        const scope = this._scope;
        const columns = await this._load(() => this._provider.getAvailableColumns(scope ? { entityName: scope.relatedEntityName } : undefined));
        return query ? columns.filter(column => this._matches(column.displayName, query)) : columns;
    }

    /** Whether the provider offers related entities to add columns from; false until they have loaded. */
    public hasScopes(): boolean {
        return this._relatedScopes.length > 0;
    }

    /** The provider's own entity, then the related ones. */
    public async getScopes(query?: string): Promise<IAvailableRelatedColumn[]> {
        const scopes = [this.getMainScope(), ...this._relatedScopes];
        return query ? scopes.filter(scope => this._matches(scope.displayName, query)) : scopes;
    }

    /** What the last failed load threw, until `clearError()`. */
    public getError(): unknown {
        return this._error;
    }

    public clearError(): void {
        this._error = undefined;
    }

    /** The scope standing for the provider's own entity, which the session starts in. */
    public getMainScope(): IAvailableRelatedColumn {
        const metadata = this._provider.getMetadata();
        const entityName = this._provider.getEntityName();
        return {
            name: metadata.PrimaryIdAttribute,
            displayName: metadata.DisplayName || metadata.LogicalName || entityName,
            relatedEntityName: entityName,
            relatedEntityDisplayName: '',
            relatedEntityPrimaryIdAttribute: metadata.PrimaryIdAttribute,
            dataType: DataTypes.LookupSimple,
            metadata: { Targets: [entityName] },
        } as IAvailableRelatedColumn;
    }

    /** Which entity the columns being added come from. */
    public setScope(scope: IAvailableRelatedColumn): void {
        this._scope = scope.relatedEntityName === this._provider.getEntityName() ? undefined : scope;
        this.events.dispatchEvent('onScopeChanged');
    }

    public addColumn(column: IColumn): void {
        const added = this._scope ? this._toScopedColumn(column, this._scope) : column;
        this._columns = [added, ...this._columns.filter(existing => existing.name !== added.name)];
        this.events.dispatchEvent('onColumnAdded', added);
        this.events.dispatchEvent('onColumnsChanged');
    }

    public removeColumn(name: string): void {
        this._columns = this._columns.filter(column => column.name !== name);
        this._removeUnusedLinking();
        this.events.dispatchEvent('onColumnsChanged');
    }

    /** Puts the column where `targetName` is. */
    public moveColumn(name: string, targetName: string): void {
        if (!targetName || name === targetName) {
            return;
        }
        const columns = [...this._columns];
        const [moved] = columns.splice(columns.findIndex(column => column.name === name), 1);
        columns.splice(columns.findIndex(column => column.name === targetName), 0, moved);
        this._columns = columns;
        this.events.dispatchEvent('onColumnsChanged');
    }

    /** Sets the columns and linking on the provider and clears its selection. */
    public save(): void {
        const provider = this._provider;
        provider.setColumns(this._columns.map((column, order) => ({ ...column, order })));
        provider.setLinking([...this._linking.values()]);
        provider.clearSelectedRecordIds();
    }

    public destroy(): void {
        this.events.clearEventListeners();
    }


    private _toScopedColumn(column: IColumn, scope: IAvailableRelatedColumn): IColumn {
        const link = this._getLink(scope);
        return { ...column, name: `${link.alias}.${column.name}`, displayName: `${column.displayName} (${scope.displayName})` };
    }

    private async _loadRelatedScopes(): Promise<void> {
        this._relatedScopes = await this._load(() => this._provider.getAvailableRelatedColumns());
        if (this._relatedScopes.length > 0) {
            this.events.dispatchEvent('onScopesLoaded');
        }
    }

    private async _load<T>(load: () => Promise<T[]>): Promise<T[]> {
        try {
            return await load();
        }
        catch (error) {
            this._error = error;
            this.events.dispatchEvent('onLoadFailed');
            return [];
        }
    }

    private _getLinkKey(scope: IAvailableRelatedColumn): string {
        return `${scope.relatedEntityPrimaryIdAttribute}_${scope.name}`;
    }

    private _getLink(scope: IAvailableRelatedColumn): ILinkEntityExposedExpression {
        const key = this._getLinkKey(scope);
        const existing = this._linking.get(key);
        if (existing) {
            return existing;
        }
        const aliases = new Set([...this._linking.values()].map(link => link.alias));
        let alias = scope.relatedEntityName;
        for (let index = 1; aliases.has(alias); index++) {
            alias = `${scope.relatedEntityName}_${index}`;
        }
        const link: ILinkEntityExposedExpression = {
            alias,
            name: scope.relatedEntityName,
            from: scope.relatedEntityPrimaryIdAttribute,
            to: scope.name,
            linkType: 'outer',
        };
        this._linking.set(key, link);
        return link;
    }

    private _removeUnusedLinking(): void {
        const usedAliases = new Set(this._columns.map(column => Attribute.GetLinkedEntityAlias(column.name)));
        for (const [key, link] of this._linking) {
            if (!usedAliases.has(link.alias)) {
                this._linking.delete(key);
            }
        }
    }

    private _matches(text: string | undefined, query: string): boolean {
        return this._normalize(text ?? '').includes(this._normalize(query));
    }

    private _normalize(text: string): string {
        return text.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
    }
}
