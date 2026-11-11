/** The replaceable pieces of what a column header draws after the name. */
export interface IColumnHeaderUiSuffixComponents {
    /** What they are drawn in. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiSuffixComponents}. */
export const ColumnHeaderUiSuffixComponents: IColumnHeaderUiSuffixComponents = {
    onRender: props => <div {...props} />,
};
