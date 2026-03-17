import { EventEmitter, IAvailableRelatedColumn, IColumn, IEventEmitter } from "@talxis/client-libraries";

export interface IEditColumnsEvents {
    onColumnAdded: (column: IColumn) => void;
    onColumnsChanged: (newColumns: IColumn[]) => void;
    onSaved: () => void;
    onRelatedEntityColumnChanged: (relatedEntityColumn: IAvailableRelatedColumn | null) => void;
}


export interface IEditColumns extends IEventEmitter<IEditColumnsEvents> {
    save(): void;
    deleteColumn(name: string): void;
    addColumn(column: IColumn): void;
    selectRelatedEntityColumn(column: IAvailableRelatedColumn): void;
    moveColumn(draggedColumnId: string, targetColumnId: string): void;
    onGetColumns(): IColumn[];
    onGetAvailableColumns(query?: string): Promise<IColumn[]>;
    onGetAvailableRelatedColumns(query?: string): Promise<IAvailableRelatedColumn[]>;
    onSelectRelatedEntityColumn(column: IAvailableRelatedColumn): void;
    onGetMainEntityColumn(): IAvailableRelatedColumn;
}

/**
 * Base class that should be extended to implement the IEditColumns interface. 
 */
export abstract class EditColumnsBase extends EventEmitter<IEditColumnsEvents> implements IEditColumns {
    
    public abstract onAddColumn(column: IColumn): void;
    public abstract onDeleteColumn(columnName: string): void;
    public abstract onMoveColumn(draggedColumnId: string, targetColumnId: string): void;
    public abstract onSelectRelatedEntityColumn(column: IAvailableRelatedColumn | null): void;
    public abstract onSave(): void;
    public abstract onGetColumns(): IColumn[];
    public abstract onGetAvailableColumns(query?: string): Promise<IColumn[]>;
    public abstract onGetAvailableRelatedColumns(query?: string): Promise<IAvailableRelatedColumn[]>;
    public abstract onGetMainEntityColumn(): IAvailableRelatedColumn;

    public addColumn(column: IColumn): void {
        this.onAddColumn(column);
        this.dispatchEvent('onColumnAdded', column);
        this.dispatchEvent('onColumnsChanged', this.onGetColumns());
    }

    public deleteColumn(name: string): void {
        this.onDeleteColumn(name);
        this.dispatchEvent('onColumnsChanged', this.onGetColumns());
    }

    public moveColumn(draggedColumnId: string, targetColumnId: string): void {
        this.onMoveColumn(draggedColumnId, targetColumnId);
        this.dispatchEvent('onColumnsChanged', this.onGetColumns());
    }

    public save(): void {
        this.onSave();
        this.dispatchEvent('onSaved');
    }

    public selectRelatedEntityColumn(column: IAvailableRelatedColumn): void {
        this.onSelectRelatedEntityColumn(column);
        this.dispatchEvent('onRelatedEntityColumnChanged', column);
    }
}


