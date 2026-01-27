import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { Attribute, DataTypes, EventEmitter, IColumn, IDataProvider } from "@talxis/client-libraries";
import { IDatasetControl } from "../../../utils/dataset-control";

export interface IEditColumnsEvents {
    onColumnAdded: (column: IColumn) => void;
    onColumnsChanged: (newColumns: IColumn[]) => void;
    onRelatedEntityColumnChanged: (relatedEntityColumn: IColumn | null) => void;
}

interface IEditColumnsModelOptions {
    datasetControl: IDatasetControl;
}


export class EditColumnsModel extends EventEmitter<IEditColumnsEvents> {
    private _datasetControl: IDatasetControl;
    private _provider: IDataProvider;
    private _currentColumns: (IColumn & { id: string })[] = [];
    private _relatedEntityColumn: IColumn | null = null;
    private _foreignKeyMap: Map<string, string> = new Map();
    public static readonly MAIN_ENTITY_COLUMN_NAME = '__main_entity__';

    constructor(options: IEditColumnsModelOptions) {
        super();
        this._datasetControl = options.datasetControl;
        this._provider = options.datasetControl.getDataset().getDataProvider();
        this._currentColumns = this._provider.getColumns().map(col => ({ ...col, id: col.name }));
    }

    public async save() {
        await this._setLinking();
        const newColumns: IColumn[] = this._currentColumns.map((col, i) => {
            const { id, ...newCol } = {
                ...col,
                order: i
            }
            return newCol;
        })
        this._provider.setColumns(newColumns);
        this._provider.clearSelectedRecordIds();
        this._datasetControl.requestRemount();
    }

    public getColumns(): (IColumn & { id: string })[] {
        return this._currentColumns;
    }

    public deleteColumn(name: string) {
        this._currentColumns = this._currentColumns.filter(col => col.name !== name);
        this.dispatchEvent('onColumnsChanged', this._currentColumns);
    }

    public addColumn(column: IColumn) {
        if (this._relatedEntityColumn) {
            column.name = `${this._generateLinkedEntityAlias(column)}.${column.name}`;
            column.displayName = `${this._relatedEntityColumn.displayName} (${column.displayName})`;
            this._foreignKeyMap.set(column.name, this._relatedEntityColumn.name);
        }
        this._currentColumns.unshift({ ...column, id: column.name });
        this.dispatchEvent('onColumnAdded', column);
        this.dispatchEvent('onColumnsChanged', this._currentColumns);
    }

    public async getAvailableColumns(query?: string): Promise<IColumn[]> {
        const entityName = this._relatedEntityColumn?.metadata?.Targets?.[0] ?? this._provider.getEntityName();
        const availableColumns = await this._provider.getAvailableColumns({ entityName: entityName });
        return availableColumns
            .filter(col => !query || col.displayName?.toLowerCase().includes(query.toLowerCase()));
    }

    public async getAvailableRelatedColumns(query?: string): Promise<IColumn[]> {
        const availableColumns = await this.getAvailableColumns(query);
        const result = availableColumns.filter(col => {
            switch (col.dataType) {
                case 'Lookup.Customer':
                case 'Lookup.Owner':
                case 'Lookup.Regarding':
                case 'Lookup.Simple': {
                    return true;
                }
                default: {
                    return false;
                }
            }
        });
        result.push(this.getMainEntityColumn());
        return result.sort((a, b) => a.displayName!.localeCompare(b.displayName!));
    }

    public selectRelatedEntityColumn(column: IColumn) {
        if(column.name === EditColumnsModel.MAIN_ENTITY_COLUMN_NAME) {
            this._relatedEntityColumn = null;
        }
        else {
            this._relatedEntityColumn = column;
        }
        this.dispatchEvent('onRelatedEntityColumnChanged', column);
    }

    public onColumnMoved(e: DragEndEvent) {
        const { active, over } = e;
        if (active.id !== over?.id) {
            const oldIndex = this._currentColumns.findIndex(col => col.id === active.id);
            const newIndex = this._currentColumns.findIndex(col => col.id === over?.id);
            this._currentColumns = arrayMove(this._currentColumns, oldIndex, newIndex);
            this.dispatchEvent('onColumnsChanged', this._currentColumns);
        }
    }

    public getMainEntityColumn(): IColumn {
        return {
            name: EditColumnsModel.MAIN_ENTITY_COLUMN_NAME,
            displayName: this._provider.getMetadata().DisplayName ?? 'Data Source',
            dataType: DataTypes.SingleLineText,
        }
    }

    private _generateLinkedEntityAlias(column: IColumn): string {
        const linkedEntities = this._provider.getLinking();
        const entityName = column.metadata?.EntityLogicalName!;
        let alias = entityName;
        let index = 0;
        while (linkedEntities.find(le => le.alias === alias)) {
            alias = `${entityName}_${index++}`;
        }
        return alias;
    }

    private async _setLinking() {
        const linking = this._provider.getLinking();
        const newLinks = await Promise.all(this._getLinkedEntityColumns().map(async column => {
            const linkedEntityAlias = Attribute.GetLinkedEntityAlias(column.name)!;
            const existingLink = linking.find(l => l.alias === linkedEntityAlias);
            const entityName = column.metadata?.EntityLogicalName!;
            const parentLinkedEntityAlias = existingLink?.parentLinkedEntityAlias ?? undefined;
            const linkType = existingLink?.linkType ?? 'outer';
            //primary key from linked entity
            const from = existingLink?.from ?? (await window.Xrm.Utility.getEntityMetadata(entityName)).PrimaryIdAttribute;
            //foreign key from main entity
            const to = existingLink?.to ?? this._foreignKeyMap.get(column.name)!;
            return {
                alias: linkedEntityAlias,
                parentLinkedEntityAlias: parentLinkedEntityAlias,
                name: entityName,
                linkType: linkType,
                from: from,
                to: to
            }
        }));
        this._provider.setLinking(newLinks);
    }

    private _getLinkedEntityColumns(): IColumn[] {
        return this._currentColumns.filter(col => {
            switch (true) {
                case this._isFileColumn(col):
                case !Attribute.GetLinkedEntityAlias(col.name): {
                    return false;
                }
                default: {
                    return true;
                }
            }
        })
    }

    private _isFileColumn(column: IColumn): boolean {
        switch (true) {
            case column.name.endsWith('.mimetype'):
            case column.name.endsWith('.filesizeinbytes'):
            case column.name.endsWith('.filename'):
            case column.name.endsWith('.imageurl'):
            case column.name.endsWith('.fullimageurl'):
            case column.name.endsWith('.filesizebytes'): {
                return true;
            }
            default: {
                return false;
            }
        }
    }
}