import { EventEmitter, IEventEmitter, IRecordSaveOperationResult, ISavedQuery } from "@talxis/client-libraries";
import { ErrorHelper } from "../error-handling/ErrorHelper";

export interface IViewSwitcherEvents {
    onSavedQueriesLoaded: () => void;
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
    areQueriesLoaded(): Promise<void>;
    updateCurrentUserQuery(): Promise<void>;
}

export abstract class ViewSwitcherBase extends EventEmitter<IViewSwitcherEvents> implements IViewSwitcher {
    public abstract onGetSystemQueries(): ISavedQuery[];
    public abstract onGetUserQueries(): ISavedQuery[];
    public abstract onGetCurrentSavedQuery(): ISavedQuery;
    public abstract onSetCurrentSavedQuery(queryId: string): void;
    public abstract onSaveNewUserQuery(data: { name: string; description: string }): Promise<string>;
    /**
    * Returns a promise that should resolve when the queries are loaded and are ready to be accessed via getSystemQueries and getUserQueries. This is needed to handle the case when the queries are loaded asynchronously, for example from a server.
    * The queries should only be loaded once, so subsequent calls to this method should return the same promise or a resolved promise if the queries are already loaded.
    */
    public abstract onAreQueriesLoaded(): Promise<void>;
    public abstract onUpdateCurrentUserQuery(): Promise<void>;

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
    public areQueriesLoaded(): Promise<void> {
        return ErrorHelper.executeWithErrorHandling({
            operation: () => this.onAreQueriesLoaded(),
            onError: (error, message) => this.dispatchEvent('onError', error, message)
        });
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
    public async updateCurrentUserQuery(): Promise<void> {
        return ErrorHelper.executeWithErrorHandling({
            operation: () => this.onUpdateCurrentUserQuery(),
            onError: (error, message) => this.dispatchEvent('onError', error, message)
        });

    }
}