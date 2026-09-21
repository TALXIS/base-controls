import { ColumnHeaderUi, IColumnHeaderContentProps } from "../ui";

/** The replaceable pieces of what a column header says the column is. */
export interface IGridColumnHeaderContentComponents {
    /** What it is drawn in. `ColumnHeaderUi.Content` draws it by default, and `IColumnHeaderContentProps` is what it takes. */
    onRenderContent: (props: IColumnHeaderContentProps) => JSX.Element;
}

/** The defaults for {@link IGridColumnHeaderContentComponents}. */
export const ColumnHeaderContentComponents: IGridColumnHeaderContentComponents = {
    onRenderContent: props => <ColumnHeaderUi.Content {...props} />,
};
