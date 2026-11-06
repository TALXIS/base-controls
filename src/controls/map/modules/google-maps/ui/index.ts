import { GoogleMapsUiRoot } from './GoogleMapsUi';
import { GoogleMapsUiMarker } from './marker';

export type { IGoogleMapsUiProps } from './GoogleMapsUi';
export * from './components';
export * from './marker';

/** The parts of {@link GoogleMapsUi}. */
export interface IGoogleMapsUiParts {
    /** One pin. */
    Marker: typeof GoogleMapsUiMarker;
}

/** The Google map as plain UI, with no runtime behind it. */
export const GoogleMapsUi: typeof GoogleMapsUiRoot & IGoogleMapsUiParts = Object.assign(GoogleMapsUiRoot, {
    Marker: GoogleMapsUiMarker,
});
