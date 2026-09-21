import { ColumnHeaderUi, IColumnHeaderUiLabelProps } from "../ui";

/** The replaceable pieces of what a column is called. */
export interface IColumnHeaderLabelComponents {
    /** The name itself. `ColumnHeaderUi.Label` draws it by default, and `IColumnHeaderUiLabelProps` is what it takes. */
    onRenderLabel: (props: IColumnHeaderUiLabelProps) => JSX.Element;
}

/** The defaults for {@link IColumnHeaderLabelComponents}. */
export const ColumnHeaderLabelComponents: IColumnHeaderLabelComponents = {
    onRenderLabel: props => <ColumnHeaderUi.Label {...props} />,
};
