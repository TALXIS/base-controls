/** The replaceable pieces of the part of a column on the scale. */
export interface IMarkerUiScaleComponents {
    /** As tall as the scale, holding the chip at its bottom. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IMarkerUiScaleComponents}. */
export const MarkerUiScaleComponents: IMarkerUiScaleComponents = {
    onRenderContainer: props => <div {...props} />,
};
