/** The replaceable pieces of the layer the markers are drawn in. */
export interface IGanttMarkerUiLayerComponents {
    /** Covers the timeline and holds every marker. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttMarkerUiLayerComponents}. */
export const GanttMarkerUiLayerComponents: IGanttMarkerUiLayerComponents = {
    onRenderContainer: props => <div {...props} />,
};
