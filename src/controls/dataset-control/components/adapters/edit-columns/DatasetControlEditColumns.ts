import { EventEmitter, IDataProvider, IEventEmitter } from "@talxis/client-libraries";
import { IDatasetControlServiceLocator } from "../../../runtime/interfaces";
import { DatasetControlEditColumnsSession } from "./DatasetControlEditColumnsSession";

export interface IDatasetControlEditColumnsEvents {
    onOpenChanged: () => void;
}

export interface IDatasetControlEditColumnsParameters {
    services: IDatasetControlServiceLocator;
    provider: IDataProvider;
}

/** Whether the column editor is open, and the edit it holds while it is. */
export class DatasetControlEditColumns {
    public readonly events: IEventEmitter<IDatasetControlEditColumnsEvents> = new EventEmitter<IDatasetControlEditColumnsEvents>();
    private _services: IDatasetControlServiceLocator;
    private _provider: IDataProvider;
    private _session?: DatasetControlEditColumnsSession;

    constructor(parameters: IDatasetControlEditColumnsParameters) {
        this._services = parameters.services;
        this._provider = parameters.provider;
        this._services.register('editColumns', () => this);
    }

    public isOpen(): boolean {
        return !!this._session;
    }

    /** Opens the editor over a copy of the provider's columns. */
    public open(): void {
        if (this._session) {
            return;
        }
        this._session = new DatasetControlEditColumnsSession({ provider: this._provider });
        this.events.dispatchEvent('onOpenChanged');
    }

    /** Closes the editor and drops whatever was not saved. */
    public close(): void {
        if (!this._session) {
            return;
        }
        this._session.destroy();
        this._session = undefined;
        this.events.dispatchEvent('onOpenChanged');
    }

    /** Writes the edit to the provider and closes the editor. */
    public save(): void {
        this._session?.save();
        this.close();
    }

    /** The edit in progress; there only while the editor is open. */
    public getSession(): DatasetControlEditColumnsSession | undefined {
        return this._session;
    }

    public destroy(): void {
        this._session?.destroy();
        if (this._services.find('editColumns') === this) {
            this._services.unregister('editColumns');
        }
        this.events.clearEventListeners();
    }
}
