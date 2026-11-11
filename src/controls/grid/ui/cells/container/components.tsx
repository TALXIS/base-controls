/** The replaceable pieces of the element a cell's content is drawn in. */
export interface ICellUiContainerComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICellUiContainerComponents}. */
export const CellUiContainerComponents: ICellUiContainerComponents = {
    onRender: props => <div {...props} />,
};
