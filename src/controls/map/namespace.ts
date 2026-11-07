import { MapRoot } from './Map';
import { IMapPopupParts, MapPopup } from './adapters/popup';
import { IMapUi, MapUi } from './ui';

/** The parts of the map, attached to the map itself. */
export interface IMapParts {
    /** The parts a pin's popup is composed of, each reading the pin's record. */
    Popup: IMapPopupParts;
    /** The map's parts as plain UI, with no map behind them. */
    Ui: IMapUi;
}

export type IMapNamespace = typeof MapRoot & IMapParts;

/** Shows the records of the provider around it as pins, drawn by its library module. */
export const Map: IMapNamespace = Object.assign(MapRoot, {
    Popup: MapPopup,
    Ui: MapUi,
});
