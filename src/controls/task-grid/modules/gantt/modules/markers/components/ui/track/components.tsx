/** The replaceable pieces of the track a marker's line runs in. */
export interface IGanttMarkerUiTrackComponents {
    /** Runs from the scale's bottom edge to the bottom of the timeline. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttMarkerUiTrackComponents}. */
export const GanttMarkerUiTrackComponents: IGanttMarkerUiTrackComponents = {
    onRenderContainer: props => <div {...props} />,
};
