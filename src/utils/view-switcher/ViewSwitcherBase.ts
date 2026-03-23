import { EventEmitter, IEventEmitter, IRecordSaveOperationResult, ISavedQuery } from "@talxis/client-libraries";
import { ErrorHelper } from "../error-handling/ErrorHelper";

export interface IViewSwitcherEvents {
    onQueryChanged: (queryId: string) => void;
    onBeforeNewQueryCreated: () => void;
    onNewQueryCreated: (queryId: string) => void;
    onError: (error: any, message: string) => void;
}

export interface IViewSwitcher extends IEventEmitter<IViewSwitcherEvents> {
    getSystemQueries(): ISavedQuery[];
    getUserQueries(): ISavedQuery[];
    setCurrentSavedQuery(queryId: string): void;
    getCurrentSavedQuery(): ISavedQuery;
    createNewUserQuery(data: { name: string; description: string }): Promise<string>;
    updateCurrentUserQuery(): Promise<IRecordSaveOperationResult>;
}

export abstract class ViewSwitcherBase extends EventEmitter<IViewSwitcherEvents> implements IViewSwitcher {
    
    public abstract onGetSystemQueries(): ISavedQuery[];
    public abstract onGetUserQueries(): ISavedQuery[];
    public abstract onGetCurrentSavedQuery(): ISavedQuery;
    public abstract onSetCurrentSavedQuery(queryId: string): void;
    public abstract onSaveNewUserQuery(data: { name: string; description: string }): Promise<string>;
    public abstract onUpdateCurrentUserQuery(): Promise<IRecordSaveOperationResult>;

    public getSystemQueries(): ISavedQuery[] {
        return this.onGetSystemQueries();
    }
    public getUserQueries(): ISavedQuery[] {
        return this.onGetUserQueries();
    }
    public getCurrentSavedQuery(): ISavedQuery {
        return this.onGetCurrentSavedQuery();
    }
    public setCurrentSavedQuery(queryId: string): void {
        this.onSetCurrentSavedQuery(queryId);
        this.dispatchEvent('onQueryChanged', queryId);
    }
    public async createNewUserQuery(data: { name: string; description: string; }): Promise<string> {
        this.dispatchEvent('onBeforeNewQueryCreated');
        const id = await ErrorHelper.executeWithErrorHandling({
            operation: () => this.onSaveNewUserQuery(data),
            onError: (error, message) => this.dispatchEvent('onError', error, message)
        });
        this.dispatchEvent('onNewQueryCreated', id)
        return id;
    }
    public async updateCurrentUserQuery(): Promise<IRecordSaveOperationResult> {
        return ErrorHelper.executeWithErrorHandling({
            operation: () => this.onUpdateCurrentUserQuery(),
            onError: (error, message) => this.dispatchEvent('onError', error, message)
        });

    }
}