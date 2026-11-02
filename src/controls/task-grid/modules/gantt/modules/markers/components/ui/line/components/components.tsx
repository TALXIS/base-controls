/** The replaceable pieces of a marker's line. */
export interface IGanttMarkerUiLineComponents {
    /** The line itself, down the whole timeline. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttMarkerUiLineComponents}. */
export const GanttMarkerUiLineComponents: IGanttMarkerUiLineComponents = {
    onRenderContainer: props => <div {...props} />,
};
