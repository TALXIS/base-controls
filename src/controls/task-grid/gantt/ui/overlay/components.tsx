/** The replaceable pieces of the cover over the Gantt. */
export interface IGanttUiOverlayComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttUiOverlayComponents}. */
export const GanttUiOverlayComponents: IGanttUiOverlayComponents = {
    onRenderContainer: props => <div {...props} />,
};
