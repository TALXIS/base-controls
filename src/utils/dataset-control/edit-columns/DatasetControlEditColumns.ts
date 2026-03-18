import { Attribute, DataTypes, IAvailableRelatedColumn, IColumn, IDataProvider, ILinkEntityExposedExpression } from "@talxis/client-libraries";
import { IDatasetControl } from "../DatasetControl";
import { EditColumnsBase } from "../../edit-columns";

interface IEditColumnsOptions {
    datasetControl: IDatasetControl;
}

export class DatasetControlEditColumns extends EditColumnsBase {
    private _datasetControl: IDatasetControl;
    private _provider: IDataProvider;
    private _currentColumns: IColumn[] = [];
    private _relatedEntityColumn: IAvailableRelatedColumn | null = null;
    private _foreignKeyEntityLinkMap: Map<string, ILinkEntityExposedExpression> = new Map();

    constructor(options: IEditColumnsOptions) {
        super();
        this._datasetControl = options.datasetControl;
        this._provider = options.datasetControl.getDataset().getDataProvider();
        this._currentColumns = this._provider.getColumns().map(col => ({ ...col, id: col.name }));
        this._foreignKeyEntityLinkMap = new Map(this._provider.getLinking().map(l => [`${l.from}_${l.to}`, l]));
    }

    public onGetColumns(): IColumn[] {
        return this._currentColumns.filter(col => !col.isHidden);
    }

    public onDeleteColumn(columnName: string): void {
        this._currentColumns = this._currentColumns.filter(col => col.name !== columnName);
        this._cleanupUnusedLinkedEntityExpression();
    }

    public onColumnsSave() {
        this._setColumns();
        this._setLinking();
        this._provider.clearSelectedRecordIds();
        this._datasetControl.requestRemount();
    }

    public onAddColumn(column: IColumn): void {
        if (this._relatedEntityColumn) {
            const linking = this._generateLinkedEntityExpression(this._relatedEntityColumn);
            column = {
                ...column,
                name: `${linking.alias}.${column.name}`,
                displayName: `${column.displayName} (${this._relatedEntityColumn.displayName})`
            }
        }
        this._currentColumns = this._currentColumns.filter(col => col.name !== column.name);
        this._currentColumns.unshift({ ...column });
    }

    public onMoveColumn(draggedColumnId: string, targetColumnId: string): void {
        if (draggedColumnId !== targetColumnId) {
            const oldIndex = this._currentColumns.findIndex(col => col.name === draggedColumnId);
            const newIndex = this._currentColumns.findIndex(col => col.name === targetColumnId);

            const newColumns = [...this._currentColumns];
            const [movedItem] = newColumns.splice(oldIndex, 1);
            newColumns.splice(newIndex, 0, movedItem);

            this._currentColumns = newColumns;
        }
    }

    public onSelectRelatedEntityColumn(column: IAvailableRelatedColumn | null) {
        //@ts-ignore - typings
        this._relatedEntityColumn = column?.name === this._provider.getMetadata().PrimaryIdAttribute ? null : { ...column };
    }

    public async onGetAvailableColumns(query?: string): Promise<IColumn[]> {
        const entityName = this._relatedEntityColumn?.metadata?.Targets?.[0] ?? this._provider.getEntityName();
        const availableColumns = await this._provider.getAvailableColumns({ entityName: entityName });
        if (!query) return availableColumns;

        const normalizedQuery = this._normalizeText(query).toLowerCase();
        return availableColumns.filter(col =>
            this._normalizeText(col.displayName || '').toLowerCase().includes(normalizedQuery)
        );
    }

    public async onGetAvailableRelatedColumns(query?: string): Promise<IAvailableRelatedColumn[]> {
        const relatedColumns = await this._provider.getAvailableRelatedColumns();
        const allColumns = [...relatedColumns, this.onGetMainEntityColumn()];

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

    public onGetMainEntityColumn(): IAvailableRelatedColumn {
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
        const existingLinkedEntity = this._foreignKeyEntityLinkMap.get(`${relatedColumn.relatedEntityPrimaryIdAttribute}_${relatedColumn.name}`);
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
        this._foreignKeyEntityLinkMap.set(`${relatedColumn.relatedEntityPrimaryIdAttribute}_${relatedColumn.name}`, linking);
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
            return {
                ...col,
                order: i
            }
        }));
    }

}