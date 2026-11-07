import { ReactNode, useMemo } from 'react';
import { getClassNames } from '@core';
import type { IMapPoint } from '../../../interfaces';
import { ILeafletUiComponents, LeafletUiComponents } from './components';
import { getLeafletUiStyles } from './styles';

/** Props for the Leaflet map, as plain UI. */
export interface ILeafletUiProps {
    tileUrl: string;
    attribution: string;
    /** Where the view starts. */
    defaultCenter: IMapPoint;
    defaultZoom: number;
    /** Drawn inside the Leaflet map, where its hooks work. */
    children?: ReactNode;
    className?: string;
    /** Replacements for its slots. */
    components?: Partial<ILeafletUiComponents>;
}

/** A Leaflet map over a tile layer; Leaflet's CSS is the app's to import. */
export const LeafletUiRoot = (props: ILeafletUiProps) => {
    const components = { ...LeafletUiComponents, ...props.components };
    const styles = useMemo(() => getLeafletUiStyles(), []);
    return components.onRenderMap({
        className: getClassNames([styles.map, props.className]),
        center: [props.defaultCenter.latitude, props.defaultCenter.longitude],
        zoom: props.defaultZoom,
        children: <>
            {components.onRenderTileLayer({ url: props.tileUrl, attribution: props.attribution })}
            {props.children}
        </>,
    });
};
