/** The replaceable pieces of the part of a column on the scale. */
export interface IGanttMarkerUiScaleComponents {
    /** As tall as the scale, holding the chip at its bottom. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IGanttMarkerUiScaleComponents}. */
export const GanttMarkerUiScaleComponents: IGanttMarkerUiScaleComponents = {
    onRenderContainer: props => <div {...props} />,
};
