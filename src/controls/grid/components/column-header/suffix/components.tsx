import { ColumnHeaderUi, IColumnHeaderUiSuffixProps } from "../ui";

/** The replaceable pieces of what a column header draws after the name. */
export interface IColumnHeaderSuffixComponents {
    /** The adornments and the uneditable icon. `ColumnHeaderUi.Suffix` draws it by default, and `IColumnHeaderUiSuffixProps` is what it takes. */
    onRenderSuffix: (props: IColumnHeaderUiSuffixProps) => JSX.Element;
}

/** The defaults for {@link IColumnHeaderSuffixComponents}. */
export const ColumnHeaderSuffixComponents: IColumnHeaderSuffixComponents = {
    onRenderSuffix: props => <ColumnHeaderUi.Suffix {...props} />,
};
