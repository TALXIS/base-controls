import { GoogleMapsUiRoot } from './GoogleMapsUi';
import { GoogleMapsUiPopup } from './popup';

export type { IGoogleMapsUiProps } from './GoogleMapsUi';
export * from './components';
export type { IGoogleMapsUiPopupProps, IGoogleMapsUiPopupComponents } from './popup';
export { GoogleMapsUiPopup, GoogleMapsUiPopupComponents } from './popup';

/** The parts of {@link GoogleMapsUi}. */
export interface IGoogleMapsUiParts {
    /** Google's info window, drawn as a Fluent callout. */
    Popup: typeof GoogleMapsUiPopup;
}

/** The Google map as plain UI, with no runtime behind it. */
export const GoogleMapsUi: typeof GoogleMapsUiRoot & IGoogleMapsUiParts = Object.assign(GoogleMapsUiRoot, {
    Popup: GoogleMapsUiPopup,
});
