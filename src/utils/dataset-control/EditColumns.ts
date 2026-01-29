import { Attribute, DataTypes, EventEmitter, IAvailableRelatedColumn, IColumn, IDataProvider, IEventEmitter, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import { IDatasetControl } from "./DatasetControl";

export interface IEditColumnsEvents {
    onColumnAdded: (column: IColumn) => void;
    onColumnsChanged: (newColumns: IColumn[]) => void;
    onRelatedEntityColumnChanged: (relatedEntityColumn: IColumn | null) => void;
}

interface IEditColumnsOptions {
    datasetControl: IDatasetControl;
}

export interface IEditColumns extends IEventEmitter<IEditColumnsEvents> {
    save(): void;
    getColumns(): (IColumn & { id: string })[];
    deleteColumn(name: string): void;
    addColumn(column: IColumn): void;
    getAvailableColumns(query?: string): Promise<IColumn[]>;
    getAvailableRelatedColumns(query?: string): Promise<IAvailableRelatedColumn[]>;
    selectRelatedEntityColumn(column: IAvailableRelatedColumn): void;
    onColumnMoved(draggedColumnId: string, targetColumnId: string): void;
    getMainEntityColumn(): IAvailableRelatedColumn;
}

export class EditColumns extends EventEmitter<IEditColumnsEvents> implements IEditColumns {
    private _datasetControl: IDatasetControl;
    private _provider: IDataProvider;
    private _currentColumns: (IColumn & { id: string })[] = [];
    private _relatedEntityColumn: IAvailableRelatedColumn | null = null;
    private _foreignKeyEntityLinkMap: Map<string, ILinkEntityExposedExpression> = new Map();

    constructor(options: IEditColumnsOptions) {
        super();
        this._datasetControl = options.datasetControl;
        this._provider = options.datasetControl.getDataset().getDataProvider();
        this._currentColumns = this._provider.getColumns().map(col => ({ ...col, id: col.name }));
        this._foreignKeyEntityLinkMap = new Map(this._provider.getLinking().map(l => [l.to, l]));
    }

    public save() {
        this._setColumns();
        this._setLinking();
        this._provider.clearSelectedRecordIds();
        this._datasetControl.requestRemount();
    }

    public getColumns(): (IColumn & { id: string })[] {
        return this._currentColumns;
    }

    public deleteColumn(name: string) {
        this._currentColumns = this._currentColumns.filter(col => col.name !== name);
        this._cleanupUnusedLinkedEntityExpression();
        this.dispatchEvent('onColumnsChanged', this._currentColumns);
    }

    public addColumn(column: IColumn) {
        if (this._relatedEntityColumn) {
            const linking = this._generateLinkedEntityExpression(this._relatedEntityColumn);
            column = {
                ...column,
                name: `${linking.alias}.${column.name}`,
                displayName: `${column.displayName} (${this._relatedEntityColumn.displayName})`
            }
        }
        this._currentColumns.unshift({ ...column, id: column.name });
        this.dispatchEvent('onColumnAdded', column);
        this.dispatchEvent('onColumnsChanged', this._currentColumns);
    }

    public async getAvailableColumns(query?: string): Promise<IColumn[]> {
        const entityName = this._relatedEntityColumn?.metadata?.Targets?.[0] ?? this._provider.getEntityName();
        const availableColumns = await this._provider.getAvailableColumns({ entityName: entityName });
        if (!query) return availableColumns;

        const normalizedQuery = this._normalizeText(query).toLowerCase();
        return availableColumns.filter(col =>
            this._normalizeText(col.displayName || '').toLowerCase().includes(normalizedQuery)
        );
    }


    public async getAvailableRelatedColumns(query?: string): Promise<IAvailableRelatedColumn[]> {
        const relatedColumns = await this._provider.getAvailableRelatedColumns();
        const allColumns = [...relatedColumns, this.getMainEntityColumn()];

        if (!query) {
            return allColumns.sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
        }

        const normalizedQuery = this._normalizeText(query).toLowerCase();
        return allColumns
            .filter(col => {
                return this._normalizeText(col.displayName || '').toLowerCase().includes(normalizedQuery);
            })
            .sort((a, b) => (a.displayName || '').localeCompare(b.displayName || ''));
    }

    public selectRelatedEntityColumn(column: IAvailableRelatedColumn) {
        this._relatedEntityColumn = column.name === this._provider.getMetadata().PrimaryIdAttribute ? null : { ...column };
        this.dispatchEvent('onRelatedEntityColumnChanged', this._relatedEntityColumn);
    }

    public onColumnMoved(draggedColumnId: string, targetColumnId: string) {
        if (draggedColumnId !== targetColumnId) {
            const oldIndex = this._currentColumns.findIndex(col => col.id === draggedColumnId);
            const newIndex = this._currentColumns.findIndex(col => col.id === targetColumnId);

            const newColumns = [...this._currentColumns];
            const [movedItem] = newColumns.splice(oldIndex, 1);
            newColumns.splice(newIndex, 0, movedItem);

            this._currentColumns = newColumns;
            this.dispatchEvent('onColumnsChanged', this._currentColumns);
        }
    }

    public getMainEntityColumn(): IAvailableRelatedColumn {
        return {
            name: this._provider.getMetadata().PrimaryIdAttribute,
            displayName: this._provider.getMetadata().DisplayName,
            relatedEntityName: this._provider.getEntityName(),
            relatedEntityDisplayName: '',
            relatedEntityPrimaryIdAttribute: this._provider.getMetadata().PrimaryIdAttribute,
            dataType: DataTypes.LookupSimple,
            metadata: {
                Targets: [this._provider.getEntityName()]
            }
        }
    }

    private _normalizeText(text: string): string {
        return text.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }

    private _generateLinkedEntityExpression(relatedColumn: IAvailableRelatedColumn): ILinkEntityExposedExpression {
        // Return existing alias if already mapped
        const existingLinkedEntity = this._foreignKeyEntityLinkMap.get(relatedColumn.name);
        if (existingLinkedEntity) {
            return existingLinkedEntity;
        }
        const existingAliases = new Set([...this._foreignKeyEntityLinkMap.values()].map(link => link.alias));
        const entityName = relatedColumn.relatedEntityName;
        let alias = entityName;
        let index = 1;

        while (existingAliases.has(alias)) {
            alias = `${entityName}_${index++}`;
        }
        const linking: ILinkEntityExposedExpression = {
            alias: alias,
            name: entityName,
            from: relatedColumn.relatedEntityPrimaryIdAttribute,
            to: relatedColumn.name,
            linkType: 'outer'
        }
        this._foreignKeyEntityLinkMap.set(relatedColumn.name, linking);
        return linking;
    }

    private _cleanupUnusedLinkedEntityExpression() {
        const currentColumnsLinks = new Set<string>(this._currentColumns.map(col => Attribute.GetLinkedEntityAlias(col.name) ?? ''));
        const linkToRemove = [...this._foreignKeyEntityLinkMap.entries()].find(([key, link]) => {
            return !currentColumnsLinks.has(link.alias);
        });
        if (linkToRemove) {
            this._foreignKeyEntityLinkMap.delete(linkToRemove[0]);
        }
    }

    private _setLinking() {
        this._provider.setLinking([...this._foreignKeyEntityLinkMap.values()]);
    }
    private _setColumns() {
        this._provider.setColumns(this._currentColumns.map((col, i) => {
            const { id, ...newCol } = {
                ...col,
                order: i
            }
            return newCol;
        }));
    }

}