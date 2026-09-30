/** The replaceable pieces of what a column header says it is, drawn in. */
export interface IColumnHeaderUiContentComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiContentComponents}. */
export const ColumnHeaderUiContentComponents: IColumnHeaderUiContentComponents = {
    onRenderContainer: props => <div {...props} />,
};
