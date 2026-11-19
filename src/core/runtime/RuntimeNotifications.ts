import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "../events";

/** One message of a notification bar. */
export interface INotificationMessage {
    /** What the message says, drawn as HTML. */
    text: string;
    /** How the message is drawn; the most severe one sets the bar's type. */
    level: 'ERROR' | 'WARNING' | 'INFO' | 'SUCCESS';
    /** Shows a close button on the message that calls it. */
    onDismiss?: () => void;
    /** Adding a message with an `id` already there replaces that message in place. */
    id?: string;
}

export interface IRuntimeNotificationsEvents {
    /** Fires when a message is added, replaced or removed. */
    onNotificationsChanged: () => void;
}

/** What the runtime has to tell the user, there while its notification bar is drawn. */
export interface IRuntimeNotifications {
    readonly events: IEventSubscriber<IRuntimeNotificationsEvents>;
    /** @returns Removes this message. */
    add(message: INotificationMessage): () => void;
    /** Removes the message with this `id`. */
    remove(id: string): void;
    /** In the order they were added. */
    getMessages(): INotificationMessage[];
}

export class RuntimeNotifications implements IRuntimeNotifications {
    public readonly events = new EventEmitter<IRuntimeNotificationsEvents>();
    private _messages: INotificationMessage[] = [];

    public add(message: INotificationMessage): () => void {
        const index = message.id === undefined ? -1 : this._messages.findIndex(existing => existing.id === message.id);
        if (index >= 0) {
            this._messages[index] = message;
        }
        else {
            this._messages.push(message);
        }
        this._dispatchChanged();
        return () => this._removeMessage(message);
    }

    public remove(id: string): void {
        const message = this._messages.find(existing => existing.id === id);
        if (message) {
            this._removeMessage(message);
        }
    }

    public getMessages(): INotificationMessage[] {
        return [...this._messages];
    }

    //a replaced or already removed message is gone, so its remover does nothing
    private _removeMessage(message: INotificationMessage): void {
        const index = this._messages.indexOf(message);
        if (index >= 0) {
            this._messages.splice(index, 1);
            this._dispatchChanged();
        }
    }

    private _dispatchChanged(): void {
        this.events.dispatchEvent('onNotificationsChanged');
    }
}
