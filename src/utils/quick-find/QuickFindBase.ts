import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";

export interface IQuickFindEvents {
    onSearchQueryChanged: (query: string) => void;
}

export interface IQuickFind extends IEventEmitter<IQuickFindEvents> {
    getSearchQuery(): string;
    /**
     * List of column display names that are being searched through
     * @returns {any}
     */
    getColumnNames: () => string[];
    setSearchQuery(query: string): void;
}

export abstract class QuickFindBase extends EventEmitter<IQuickFindEvents> implements IQuickFind {
    public abstract onGetSearchQuery(): string;
    public abstract onSetSearchQuery(query: string): void;
    public abstract onGetColumnNames(): string[];

    public getSearchQuery(): string {
        return this.onGetSearchQuery();
    }
    public setSearchQuery(query: string): void {
        this.onSetSearchQuery(query);
        this.dispatchEvent("onSearchQueryChanged", query);  
    }
    public getColumnNames(): string[] {
        return this.onGetColumnNames();
    }
}