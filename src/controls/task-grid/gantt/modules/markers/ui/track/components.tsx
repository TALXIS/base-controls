/** The replaceable pieces of the track a marker's line runs in. */
export interface IMarkerUiTrackComponents {
    /** Runs from the scale's bottom edge to the bottom of the timeline. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IMarkerUiTrackComponents}. */
export const MarkerUiTrackComponents: IMarkerUiTrackComponents = {
    onRender: props => <div {...props} />,
};
