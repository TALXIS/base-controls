import { ColumnHeaderUi, IColumnHeaderLabelProps } from "../ui";

/** The replaceable pieces of what a column is called. */
export interface IGridColumnHeaderLabelComponents {
    /** The name itself. `ColumnHeaderUi.Label` draws it by default, and `IColumnHeaderLabelProps` is what it takes. */
    onRenderLabel: (props: IColumnHeaderLabelProps) => JSX.Element;
}

/** The defaults for {@link IGridColumnHeaderLabelComponents}. */
export const ColumnHeaderLabelComponents: IGridColumnHeaderLabelComponents = {
    onRenderLabel: props => <ColumnHeaderUi.Label {...props} />,
};
