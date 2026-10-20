import { IMapSearchBoxProps, MapSearchBox } from '../map-search-box';

/** The replaceable parts of the search module's UI. Override any subset through the module's `components` option. */
export interface IMapSearchComponents {
    /** The search box, with its suggestions. */
    onRenderSearchBox: (props: IMapSearchBoxProps) => JSX.Element;
}

/** The defaults for {@link IMapSearchComponents}. */
export const MapSearchComponents: IMapSearchComponents = {
    onRenderSearchBox: (props) => <MapSearchBox {...props} />
};
