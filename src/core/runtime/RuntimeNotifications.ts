import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "../events";

/** One message of a notification bar. */
export interface INotificationMessage {
    /** What the message says, drawn as HTML. */
    text: string;
    /** How the message is drawn; the most severe one sets the bar's type. */
    level: 'ERROR' | 'WARNING' | 'INFO';
    /** Shows a close button on the message that calls it. */
    onDismiss?: () => void;
}

export interface IRuntimeNotificationsEvents {
    /** Fires when a message is added, replaced or removed. */
    onNotificationsChanged: () => void;
}

/** What the runtime has to tell the user, there while its notification bar is drawn. */
export interface IRuntimeNotifications {
    readonly events: IEventSubscriber<IRuntimeNotificationsEvents>;
    /**
     * Adds a message; one added under an `id` already there replaces that message in place.
     * @returns Removes this message.
     */
    add(message: INotificationMessage, id?: string): () => void;
    /** Removes the message added under `id`. */
    remove(id: string): void;
    /** In the order they were added. */
    getMessages(): INotificationMessage[];
}

interface IEntry {
    message: INotificationMessage;
    id?: string;
}

export class RuntimeNotifications implements IRuntimeNotifications {
    public readonly events = new EventEmitter<IRuntimeNotificationsEvents>();
    private _entries: IEntry[] = [];

    public add(message: INotificationMessage, id?: string): () => void {
        const entry: IEntry = { message, id };
        const index = id === undefined ? -1 : this._entries.findIndex(existing => existing.id === id);
        if (index >= 0) {
            this._entries[index] = entry;
        }
        else {
            this._entries.push(entry);
        }
        this._dispatchChanged();
        return () => this._removeEntry(entry);
    }

    public remove(id: string): void {
        const entry = this._entries.find(existing => existing.id === id);
        if (entry) {
            this._removeEntry(entry);
        }
    }

    public getMessages(): INotificationMessage[] {
        return this._entries.map(entry => entry.message);
    }

    //a replaced or already removed entry is gone, so its remover does nothing
    private _removeEntry(entry: IEntry): void {
        const index = this._entries.indexOf(entry);
        if (index >= 0) {
            this._entries.splice(index, 1);
            this._dispatchChanged();
        }
    }

    private _dispatchChanged(): void {
        this.events.dispatchEvent('onNotificationsChanged');
    }
}
