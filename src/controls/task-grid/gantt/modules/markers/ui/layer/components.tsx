/** The replaceable pieces of the layer the markers are drawn in. */
export interface IMarkerUiLayerComponents {
    /** Covers the timeline and holds every marker. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IMarkerUiLayerComponents}. */
export const MarkerUiLayerComponents: IMarkerUiLayerComponents = {
    onRenderContainer: props => <div {...props} />,
};
