import { ColumnHeaderUi, IColumnHeaderUiPrefixProps } from "../ui";

/** The replaceable pieces of what a column header draws before the name. */
export interface IColumnHeaderPrefixComponents {
    /** What the adornments are drawn in. `ColumnHeaderUi.Prefix` draws it by default, and `IColumnHeaderUiPrefixProps` is what it takes. */
    onRenderPrefix: (props: IColumnHeaderUiPrefixProps) => JSX.Element;
}

/** The defaults for {@link IColumnHeaderPrefixComponents}. */
export const ColumnHeaderPrefixComponents: IColumnHeaderPrefixComponents = {
    onRenderPrefix: props => <ColumnHeaderUi.Prefix {...props} />,
};
