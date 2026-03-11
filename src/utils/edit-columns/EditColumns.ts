import { EventEmitter, IAvailableRelatedColumn, IColumn, IEventEmitter } from "@talxis/client-libraries";

export interface IEditColumnsEvents {
    onColumnAdded: (column: IColumn) => void;
    onColumnsChanged: (newColumns: IColumn[]) => void;
    onSaved: () => void;
    onRelatedEntityColumnChanged: (relatedEntityColumn: IColumn | null) => void;
}


export interface IEditColumns extends IEventEmitter<IEditColumnsEvents> {
    save(): void;
    getColumns(): IColumn[];
    deleteColumn(name: string): void;
    addColumn(column: IColumn): void;
    getAvailableColumns(query?: string): Promise<IColumn[]>;
    getAvailableRelatedColumns(query?: string): Promise<IAvailableRelatedColumn[]>;
    selectRelatedEntityColumn(column: IAvailableRelatedColumn): void;
    moveColumn(draggedColumnId: string, targetColumnId: string): void;
    getMainEntityColumn(): IAvailableRelatedColumn;
}

/**
 * Base class that should be extended to implement the IEditColumns interface. 
 */
export abstract class EditColumnsBase extends EventEmitter<IEditColumnsEvents> implements IEditColumns {
    
    public abstract onAddColumn(column: IColumn): void;
    public abstract onDeleteColumn(columnName: string): void;
    public abstract onMoveColumn(draggedColumnId: string, targetColumnId: string): void;
    public abstract onSave(): void;
    public abstract getColumns(): IColumn[];
    public abstract getAvailableColumns(query?: string): Promise<IColumn[]>;
    public abstract getAvailableRelatedColumns(query?: string): Promise<IAvailableRelatedColumn[]>;
    public abstract selectRelatedEntityColumn(column: IAvailableRelatedColumn): void;
    public abstract getMainEntityColumn(): IAvailableRelatedColumn;

    public addColumn(column: IColumn): void {
        this.onAddColumn(column);
        this.dispatchEvent('onColumnAdded', column);
        this.dispatchEvent('onColumnsChanged', this.getColumns());
    }

    public deleteColumn(name: string): void {
        this.onDeleteColumn(name);
        this.dispatchEvent('onColumnsChanged', this.getColumns());
    }

    public moveColumn(draggedColumnId: string, targetColumnId: string): void {
        this.onMoveColumn(draggedColumnId, targetColumnId);
        this.dispatchEvent('onColumnsChanged', this.getColumns());
    }
    public save(): void {
        this.onSave();
        this.dispatchEvent('onSaved');
    }
}


