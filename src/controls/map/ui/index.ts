import { MapUiContainer } from './container';

export * from './container';

/** The map's own UI, with no runtime behind it. */
export interface IMapUi {
    Container: typeof MapUiContainer;
}

export const MapUi: IMapUi = {
    Container: MapUiContainer,
};
