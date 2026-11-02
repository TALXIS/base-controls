/** The replaceable pieces of the column that places one marker. */
export interface IGanttMarkerUiColumnComponents {
    /** Sits at the marker's date and holds its track and scale. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttMarkerUiColumnComponents}. */
export const GanttMarkerUiColumnComponents: IGanttMarkerUiColumnComponents = {
    onRenderContainer: props => <div {...props} />,
};
