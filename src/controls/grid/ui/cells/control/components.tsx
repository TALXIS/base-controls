/** The replaceable pieces of the room a cell's value is drawn in. */
export interface ICellUiControlComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICellUiControlComponents}. */
export const CellUiControlComponents: ICellUiControlComponents = {
    onRender: props => <div {...props} />,
};
