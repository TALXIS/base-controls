import { EventEmitter, IEventEmitter } from "@talxis/client-libraries";
import { notImplemented } from "./utils";

export interface IFactoryApiEvents {
    onRequestRender: () => void;
}

export interface IFactoryApiParams {
    requestRender?: () => void;
}

export class FactoryApi implements ComponentFramework.Factory {
    public readonly events: IEventEmitter<IFactoryApiEvents> = new EventEmitter<IFactoryApiEvents>();

    public getPopupService(): ComponentFramework.FactoryApi.Popup.PopupService {
        return notImplemented("factory.getPopupService");
    }

    public requestRender(): void {
        this.events.dispatchEvent("onRequestRender");
    }
}
