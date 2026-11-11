/** The replaceable pieces of the column that places one marker. */
export interface IMarkerUiColumnComponents {
    /** Sits at the marker's date and holds its track and scale. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IMarkerUiColumnComponents}. */
export const MarkerUiColumnComponents: IMarkerUiColumnComponents = {
    onRender: props => <div {...props} />,
};
