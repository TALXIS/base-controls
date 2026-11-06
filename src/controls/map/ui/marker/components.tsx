/** The replaceable pieces of a pin. */
export interface IMapUiMarkerComponents {
    /** The box the map library anchors at its bottom centre. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The teardrop. */
    onRenderPin: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** The white centre of the teardrop. */
    onRenderDot: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IMapUiMarkerComponents}. */
export const MapUiMarkerComponents: IMapUiMarkerComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderPin: props => <div {...props} />,
    onRenderDot: props => <div {...props} />,
};
