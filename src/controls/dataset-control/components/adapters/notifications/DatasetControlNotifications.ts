import { EventEmitter, IDataProvider, IEventEmitter } from "@talxis/client-libraries";
import { INotificationMessage } from "@ui/notifications";
import { IEventSubscriber } from "@utils";

/** What the notifications raise. */
export interface IDatasetControlNotificationsEvents {
    /** The messages changed. */
    onNotificationsChanged: () => void;
}

export interface IDatasetControlNotificationsParameters {
    provider: IDataProvider;
}

/** What the control has to tell the user about its records. */
export interface IDatasetControlNotifications {
    /** Subscribe to the notifications' events. */
    readonly events: IEventSubscriber<IDatasetControlNotificationsEvents>;
    /** The provider's load error, while there is one. */
    getMessages(): INotificationMessage[];
}

export class DatasetControlNotifications implements IDatasetControlNotifications {
    public readonly events: IEventEmitter<IDatasetControlNotificationsEvents> = new EventEmitter<IDatasetControlNotificationsEvents>();
    private _provider: IDataProvider;

    constructor(parameters: IDatasetControlNotificationsParameters) {
        this._provider = parameters.provider;
        this._provider.addEventListener('onError', this._onChanged);
        this._provider.addEventListener('onNewDataLoaded', this._onChanged);
    }

    /** The provider's load error, while there is one. */
    public getMessages(): INotificationMessage[] {
        return this._provider.isError() ? [{ text: this._provider.getErrorMessage(), level: 'ERROR' }] : [];
    }

    //the provider outlives the notifications
    public destroy(): void {
        this._provider.removeEventListener('onError', this._onChanged);
        this._provider.removeEventListener('onNewDataLoaded', this._onChanged);
        this.events.clearEventListeners();
    }


    private _onChanged = (): void => {
        this.events.dispatchEvent('onNotificationsChanged');
    };
}
