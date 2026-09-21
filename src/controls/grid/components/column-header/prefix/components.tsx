import { ColumnHeaderUi, IColumnHeaderPrefixProps } from "../ui";

/** The replaceable pieces of what a column header draws before the name. */
export interface IGridColumnHeaderPrefixComponents {
    /** What the adornments are drawn in. `ColumnHeaderUi.Prefix` draws it by default, and `IColumnHeaderPrefixProps` is what it takes. */
    onRenderPrefix: (props: IColumnHeaderPrefixProps) => JSX.Element;
}

/** The defaults for {@link IGridColumnHeaderPrefixComponents}. */
export const ColumnHeaderPrefixComponents: IGridColumnHeaderPrefixComponents = {
    onRenderPrefix: props => <ColumnHeaderUi.Prefix {...props} />,
};
