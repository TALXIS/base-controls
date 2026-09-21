import { ColumnHeaderUi, IColumnHeaderSuffixProps } from "../ui";

/** The replaceable pieces of what a column header draws after the name. */
export interface IGridColumnHeaderSuffixComponents {
    /** The adornments and the uneditable icon. `ColumnHeaderUi.Suffix` draws it by default, and `IColumnHeaderSuffixProps` is what it takes. */
    onRenderSuffix: (props: IColumnHeaderSuffixProps) => JSX.Element;
}

/** The defaults for {@link IGridColumnHeaderSuffixComponents}. */
export const ColumnHeaderSuffixComponents: IGridColumnHeaderSuffixComponents = {
    onRenderSuffix: props => <ColumnHeaderUi.Suffix {...props} />,
};
