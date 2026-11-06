import type { ReactNode } from 'react';
import type { LatLngTuple } from 'leaflet';
import { ILeafletUiMarkerComponents, LeafletUiMarkerComponents } from './components';

export interface ILeafletUiMarkerProps {
    center: LatLngTuple;
    /** What its popup shows. */
    children?: ReactNode;
    /** Replacements for its slots. */
    components?: Partial<ILeafletUiMarkerComponents>;
}

/** One pin, as a circle with a popup; it needs no image assets. */
export const LeafletUiMarker = (props: ILeafletUiMarkerProps) => {
    const components = { ...LeafletUiMarkerComponents, ...props.components };
    return components.onRenderMarker({
        center: props.center,
        radius: 8,
        children: components.onRenderPopup({ children: props.children }),
    });
};
