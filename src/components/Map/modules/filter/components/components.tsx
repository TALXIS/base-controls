import { IMapFilterPanelProps, MapFilterPanel } from '../map-filter-panel';

/** The replaceable parts of the filter module's UI. Override any subset through the module's `components` option. */
export interface IMapFilterComponents {
    /** The panel listing the values the records hold, one list per attribute. */
    onRenderFilterPanel: (props: IMapFilterPanelProps) => JSX.Element;
}

/** The defaults for {@link IMapFilterComponents}. */
export const MapFilterComponents: IMapFilterComponents = {
    onRenderFilterPanel: (props) => <MapFilterPanel {...props} />
};
