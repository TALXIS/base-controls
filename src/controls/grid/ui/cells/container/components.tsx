/** The replaceable pieces of the element a cell's content is drawn in. */
export interface ICellUiContainerComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICellUiContainerComponents}. */
export const CellUiContainerComponents: ICellUiContainerComponents = {
    onRenderContainer: props => <div {...props} />,
};
