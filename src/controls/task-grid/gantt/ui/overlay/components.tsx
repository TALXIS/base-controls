/** The replaceable pieces of the cover over the Gantt. */
export interface IGanttUiOverlayComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttUiOverlayComponents}. */
export const GanttUiOverlayComponents: IGanttUiOverlayComponents = {
    onRender: props => <div {...props} />,
};
