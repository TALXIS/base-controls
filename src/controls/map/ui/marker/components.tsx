import { IMapUiMarkerPinProps, MapUiMarkerPin } from "../marker-pin";

/** The replaceable pieces of a pin. */
export interface IMapUiMarkerComponents {
    /** The box the map library anchors at its bottom centre. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The teardrop; give it a `color` to change its fill. */
    onRenderPin: (props: IMapUiMarkerPinProps) => JSX.Element | null;
    /** The white centre of the teardrop. */
    onRenderDot: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IMapUiMarkerComponents}. */
export const MapUiMarkerComponents: IMapUiMarkerComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderPin: props => <MapUiMarkerPin {...props} />,
    onRenderDot: props => <div {...props} />,
};
