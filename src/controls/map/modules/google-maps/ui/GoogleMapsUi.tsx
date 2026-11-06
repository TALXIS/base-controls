import { ReactNode, useMemo } from 'react';
import { getClassNames } from '@core';
import type { IMapPoint } from '../../../interfaces';
import { GoogleMapsUiComponents, IGoogleMapsUiComponents } from './components';
import { getGoogleMapsUiStyles } from './styles';

/** Props for the Google map, as plain UI; it renders inside an `APIProvider`. */
export interface IGoogleMapsUiProps {
    /** Where the view starts. */
    defaultCenter: IMapPoint;
    defaultZoom: number;
    /** Drawn inside the Google map, where its hooks work. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IGoogleMapsUiComponents>;
}

/** A Google map without its default controls. */
export const GoogleMapsUiRoot = (props: IGoogleMapsUiProps) => {
    const components = { ...GoogleMapsUiComponents, ...props.components };
    const styles = useMemo(() => getGoogleMapsUiStyles(), []);
    return components.onRenderMap({
        className: getClassNames([styles.map, props.className]),
        defaultCenter: { lat: props.defaultCenter.latitude, lng: props.defaultCenter.longitude },
        defaultZoom: props.defaultZoom,
        disableDefaultUI: true,
        children: props.children,
    });
};
