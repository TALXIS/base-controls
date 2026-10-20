import { IMapLegendProps, MapLegend } from '../map-legend';

/** The replaceable parts of the legend module's UI. Override any subset through the module's `components` option. */
export interface IMapLegendComponents {
    /** The legend itself: the button beside the provider picker, and the panel it opens. */
    onRenderLegend: (props: IMapLegendProps) => JSX.Element;
}

/** The defaults for {@link IMapLegendComponents}. */
export const MapLegendComponents: IMapLegendComponents = {
    onRenderLegend: (props) => <MapLegend {...props} />
};
