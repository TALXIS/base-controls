/** The replaceable pieces of a marker's line. */
export interface IMarkerUiLineComponents {
    /** The line itself, down the whole timeline. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IMarkerUiLineComponents}. */
export const MarkerUiLineComponents: IMarkerUiLineComponents = {
    onRender: props => <div {...props} />,
};
