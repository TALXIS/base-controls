import type { IDataProvider, IRawRecord } from "@talxis/client-libraries";
import type { IUserQueriesStore, IUserQueryListItem, IUserQueryView } from "../interfaces";
import { ILocalStorageUserQueriesProviderParameters, LocalStorageUserQueriesProvider, readViews } from "./LocalStorageUserQueriesProvider";

/** The user's views kept in one localStorage entry, with their columns, linking and data as JSON. */
export class LocalStorageUserQueriesStore<TData = unknown> implements IUserQueriesStore<TData> {
    private _parameters: ILocalStorageUserQueriesProviderParameters;

    constructor(parameters: ILocalStorageUserQueriesProviderParameters) {
        this._parameters = parameters;
    }

    public async getViews(): Promise<IUserQueryListItem[]> {
        return this._read().map(view => ({ id: view.id, name: view.name ?? '' }));
    }

    public async getView(viewId: string): Promise<IUserQueryView<TData>> {
        const view = this._read().find(view => view.id === viewId)?.view;
        return view ? JSON.parse(view) : { columns: [] };
    }

    public async createView(name: string, view: IUserQueryView<TData>): Promise<string> {
        const id = crypto.randomUUID();
        this._write([...this._read(), { id, name, view: JSON.stringify(view) }]);
        return id;
    }

    public async updateView(viewId: string, view: IUserQueryView<TData>): Promise<void> {
        this._write(this._read().map(stored => stored.id === viewId ? { ...stored, view: JSON.stringify(view) } : stored));
    }

    public createManageProvider(): IDataProvider {
        return new LocalStorageUserQueriesProvider(this._parameters);
    }

    private _read(): IRawRecord[] {
        return readViews(this._parameters.storageKey);
    }

    private _write(views: IRawRecord[]): void {
        window.localStorage.setItem(this._parameters.storageKey, JSON.stringify(views));
    }
}
