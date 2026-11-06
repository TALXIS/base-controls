import { LeafletUiRoot } from './LeafletUi';
import { LeafletUiMarker } from './marker';

export type { ILeafletUiProps } from './LeafletUi';
export * from './components';
export * from './marker';

/** The parts of {@link LeafletUi}. */
export interface ILeafletUiParts {
    /** One pin. */
    Marker: typeof LeafletUiMarker;
}

/** The Leaflet map as plain UI, with no runtime behind it. */
export const LeafletUi: typeof LeafletUiRoot & ILeafletUiParts = Object.assign(LeafletUiRoot, {
    Marker: LeafletUiMarker,
});
