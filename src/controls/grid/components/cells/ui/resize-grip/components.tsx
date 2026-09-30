/** The replaceable pieces of what a row is dragged taller by. */
export interface ICellUiResizeGripComponents {
    /** What the cell's content and the grip are drawn in, and what is measured as the drag starts. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement> & React.RefAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What the drag is started from. */
    onRenderGrip: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICellUiResizeGripComponents}. */
export const CellUiResizeGripComponents: ICellUiResizeGripComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderGrip: props => <div {...props} />,
};
