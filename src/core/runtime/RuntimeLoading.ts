import { EventEmitter } from "@talxis/client-libraries";
import type { IEventSubscriber } from "../events";

export interface IRuntimeLoadingEvents {
    /** Fires when the loading is shown, taken away, or its message changes. */
    onLoadingChanged: (isLoading: boolean, message?: string) => void;
}

/** Whether something the runtime runs is waited on. */
export interface IRuntimeLoading {
    readonly events: IEventSubscriber<IRuntimeLoadingEvents>;
    /**
     * Shows the loading until every caller has hidden it again.
     * @returns Hides it for this caller.
     */
    show(message?: string): () => void;
    isLoading(): boolean;
    /** The message of the latest caller still showing the loading. */
    getMessage(): string | undefined;
}

interface IShowing {
    message?: string;
}

export class RuntimeLoading implements IRuntimeLoading {
    public readonly events = new EventEmitter<IRuntimeLoadingEvents>();
    private _showings: IShowing[] = [];

    public show(message?: string): () => void {
        const showing: IShowing = { message };
        this._showings.push(showing);
        this._dispatchChanged();
        return () => this._hide(showing);
    }

    public isLoading(): boolean {
        return this._showings.length > 0;
    }

    public getMessage(): string | undefined {
        return this._showings[this._showings.length - 1]?.message;
    }

    //a caller hiding twice takes nothing from the others
    private _hide(showing: IShowing): void {
        const index = this._showings.indexOf(showing);
        if (index >= 0) {
            this._showings.splice(index, 1);
            this._dispatchChanged();
        }
    }

    private _dispatchChanged(): void {
        this.events.dispatchEvent('onLoadingChanged', this.isLoading(), this.getMessage());
    }
}
