/** The replaceable pieces of what a column header draws before what names it. */
export interface IColumnHeaderUiPrefixComponents {
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiPrefixComponents}. */
export const ColumnHeaderUiPrefixComponents: IColumnHeaderUiPrefixComponents = {
    onRender: props => <div {...props} />,
};
