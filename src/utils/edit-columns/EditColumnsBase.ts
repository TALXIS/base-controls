import { EventEmitter, IAvailableRelatedColumn, IColumn, IEventEmitter } from "@talxis/client-libraries";

export interface IEditColumnsEvents {
    onColumnAdded: (column: IColumn) => void;
    onColumnsChanged: (newColumns: IColumn[]) => void;
    onColumnsSaved: () => void;
    onScopeColumnChanged: (scopeColumn: IAvailableRelatedColumn) => void;
}


export interface IEditColumns extends IEventEmitter<IEditColumnsEvents> {
    save(): void;
    deleteColumn(name: string): void;
    addColumn(column: IColumn): void;
    setScopeColumn(column: IAvailableRelatedColumn): void;
    moveColumn(draggedColumnId: string, targetColumnId: string): void;
    getColumns(): IColumn[];
    getScopeColumn(): IAvailableRelatedColumn;
    getAvailableColumns(query?: string): Promise<IColumn[]>;
    getAvailableScopeColumns(query?: string): Promise<IAvailableRelatedColumn[]>;
}

/**
 * Base class that should be extended to implement the IEditColumns interface. 
 */
export abstract class EditColumnsBase extends EventEmitter<IEditColumnsEvents> implements IEditColumns {
    
    public abstract onAddColumn(column: IColumn): void;
    public abstract onDeleteColumn(columnName: string): void;
    public abstract onMoveColumn(draggedColumnId: string, targetColumnId: string): void;
    public abstract onSetScopeColumn(column: IAvailableRelatedColumn): void;
    public abstract onColumnsSave(): void;
    public abstract onGetColumns(): IColumn[];
    public abstract onGetAvailableColumns(query?: string): Promise<IColumn[]>;
    public abstract onGetAvailableScopeColumns(query?: string): Promise<IAvailableRelatedColumn[]>;
    public abstract onGetScopeColumn(): IAvailableRelatedColumn;

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
        this.onColumnsSave();
        this.dispatchEvent('onColumnsSaved');
    }

    public setScopeColumn(column: IAvailableRelatedColumn): void {
        this.onSetScopeColumn(column);
        this.dispatchEvent('onScopeColumnChanged', column);
    }
    
    public getAvailableScopeColumns(query?: string): Promise<IAvailableRelatedColumn[]> {
        return this.onGetAvailableScopeColumns(query);
    }

    public getColumns(): IColumn[] {
        return this.onGetColumns();
    }

    public getAvailableColumns(query?: string): Promise<IColumn[]> {
        return this.onGetAvailableColumns(query);
    }

    public getScopeColumn(): IAvailableRelatedColumn {
        return this.onGetScopeColumn();
    }
    
}


