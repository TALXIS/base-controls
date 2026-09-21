import { ColumnHeaderUi, IColumnHeaderUiContentProps } from "../ui";

/** The replaceable pieces of what a column header says the column is. */
export interface IColumnHeaderContentComponents {
    /** What it is drawn in. `ColumnHeaderUi.Content` draws it by default, and `IColumnHeaderUiContentProps` is what it takes. */
    onRenderContent: (props: IColumnHeaderUiContentProps) => JSX.Element;
}

/** The defaults for {@link IColumnHeaderContentComponents}. */
export const ColumnHeaderContentComponents: IColumnHeaderContentComponents = {
    onRenderContent: props => <ColumnHeaderUi.Content {...props} />,
};
