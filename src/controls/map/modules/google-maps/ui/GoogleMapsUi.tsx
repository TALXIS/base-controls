import { ReactNode, useMemo } from 'react';
import { ColorScheme } from '@vis.gl/react-google-maps';
import { getClassNames } from '@core';
import { useTheme } from '@theme';
import type { IMapPoint } from '../../../interfaces';
import { GoogleMapsUiComponents, IGoogleMapsUiComponents } from './components';
import { getGoogleMapsUiStyles } from './styles';

/** Props for the Google map, as plain UI; it renders inside an `APIProvider`. */
export interface IGoogleMapsUiProps {
    /** Where the view starts. */
    defaultCenter: IMapPoint;
    defaultZoom: number;
    /** The Map ID from Google Cloud's Map management; Advanced Markers need one. */
    mapId: string;
    /** Drawn inside the Google map, where its hooks work. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<IGoogleMapsUiComponents>;
}

/** A Google map without its default controls, dark on a theme with a dark background. */
export const GoogleMapsUiRoot = (props: IGoogleMapsUiProps) => {
    const components = { ...GoogleMapsUiComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGoogleMapsUiStyles(), []);
    return components.onRender({
        className: getClassNames([styles.map, props.className]),
        defaultCenter: { lat: props.defaultCenter.latitude, lng: props.defaultCenter.longitude },
        defaultZoom: props.defaultZoom,
        mapId: props.mapId,
        colorScheme: theme.isInverted ? ColorScheme.DARK : ColorScheme.LIGHT,
        disableDefaultUI: true,
        children: props.children,
    });
};
