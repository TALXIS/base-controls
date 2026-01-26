import { DragEndEvent } from "@dnd-kit/core";
import { arrayMove } from "@dnd-kit/sortable";
import { EventEmitter, IColumn, IDataProvider } from "@talxis/client-libraries";
import { IDatasetControl } from "../../../utils/dataset-control";

export interface IEditColumnsEvents {
    onColumnsChanged: (newColumns: IColumn[]) => void;
}

interface IEditColumnsModelOptions {
    datasetControl: IDatasetControl;
}


export class EditColumnsModel extends EventEmitter<IEditColumnsEvents> {
    private _datasetControl: IDatasetControl;
    private _provider: IDataProvider;
    private _currentColumns: (IColumn & {id: string})[] = [];
    constructor(options: IEditColumnsModelOptions) {
        super();
        this._datasetControl = options.datasetControl;
        this._provider = options.datasetControl.getDataset().getDataProvider();
        this._currentColumns = this._provider.getColumns().map(col => ({ ...col, id: col.name }));
    }

    public save() {
        const newColumns: IColumn[] = this._currentColumns.map((col, i) => {
            const { id, ...newCol } = {
                ...col,
                order: i
            }
            return newCol;
        })
        this._provider.setColumns(newColumns);
        //we should instead trigger a complete onmount on dataset control
        this._provider.refresh();
    }

    public getColumns(): (IColumn & {id: string})[] {
        return this._currentColumns;
    }

    public deleteColumn(name: string) {
        this._currentColumns = this._currentColumns.filter(col => col.name !== name);
        this.dispatchEvent('onColumnsChanged', this._currentColumns);
    }

    public addColumn(column: IColumn) {
        this._currentColumns.unshift({ ...column, id: column.name });
        this.dispatchEvent('onColumnsChanged', this._currentColumns);
    }

    public async getAvailableColumns(query?: string): Promise<IColumn[]> {
        const availableColumns = await this._provider.getAvailableColumns();
        return availableColumns
            .filter(col => !query || col.displayName?.toLowerCase().includes(query.toLowerCase()));
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
}