import { IDataProvider } from "@talxis/client-libraries";
import { IGridServiceRegistryInternal } from "..";

export interface IGridProviderLoadingParameters {
    services: IGridServiceRegistryInternal;
}

/** Shows the grid's loading while its provider loads. */
export class GridProviderLoading {
    private _services: IGridServiceRegistryInternal;
    private _hideLoading?: () => void;

    constructor(parameters: IGridProviderLoadingParameters) {
        this._services = parameters.services;
        this._services.observe('provider', provider => this._onProviderAvailable(provider));
    }

    private _onProviderAvailable(provider: IDataProvider): () => void {
        const stopProvider = provider.addEventListener('onLoading', this._onLoading);
        this._onLoading();
        return () => {
            stopProvider();
            this._hide();
        };
    }

    private _onLoading = (): void => {
        const provider = this._services.get('provider');
        if (!provider.isLoading()) {
            this._hide();
        }
        else if (!this._hideLoading) {
            this._hideLoading = this._services.get('grid').loading.show(provider.getLoadingMessage() || undefined);
        }
    };

    private _hide(): void {
        this._hideLoading?.();
        this._hideLoading = undefined;
    }
}
