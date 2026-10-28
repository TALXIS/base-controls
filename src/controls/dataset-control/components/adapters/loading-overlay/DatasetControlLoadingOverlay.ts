import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { IEventSubscriber } from "@utils";

/** What the loading overlay raises. */
export interface IDatasetControlLoadingOverlayEvents {
    /** The overlay was shown, taken away, or its message changed. */
    onLoadingChanged: (isLoading: boolean, message?: string) => void;
}

/** The overlay that covers the whole control while something runs. */
export interface IDatasetControlLoadingOverlay {
    /** Subscribe to the overlay's events. */
    readonly events: IEventSubscriber<IDatasetControlLoadingOverlayEvents>;
    /**
     * Covers the whole control until every caller has hidden it again.
     * @returns Hides it for this caller.
     */
    show(message?: string): () => void;
    /** Whether the overlay is shown. */
    isLoading(): boolean;
    /** The message of the latest caller still showing the overlay. */
    getMessage(): string | undefined;
}

interface IShowing {
    message?: string;
}

export class DatasetControlLoadingOverlay implements IDatasetControlLoadingOverlay {
    public readonly events: IEventEmitter<IDatasetControlLoadingOverlayEvents> = new EventEmitter<IDatasetControlLoadingOverlayEvents>();
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
