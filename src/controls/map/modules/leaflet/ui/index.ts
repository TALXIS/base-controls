import { LeafletUiRoot } from './LeafletUi';
import { LeafletUiPopup } from './popup';

export type { ILeafletUiProps } from './LeafletUi';
export * from './components';
export * from './popup';

/** The parts of {@link LeafletUi}. */
export interface ILeafletUiParts {
    /** Leaflet's popup, drawn as a Fluent callout. */
    Popup: typeof LeafletUiPopup;
}

/** The Leaflet map as plain UI, with no runtime behind it. */
export const LeafletUi: typeof LeafletUiRoot & ILeafletUiParts = Object.assign(LeafletUiRoot, {
    Popup: LeafletUiPopup,
});
