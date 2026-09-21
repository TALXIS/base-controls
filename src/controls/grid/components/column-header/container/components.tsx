import { ColumnHeaderUi, IColumnHeaderContainerProps } from "../ui";

/** The replaceable pieces of what a column header is drawn in. */
export interface IGridColumnHeaderContainerComponents {
    /** The element itself, around what the header draws. `ColumnHeaderUi.Container` draws it by default, and `IColumnHeaderContainerProps` is what it takes. */
    onRenderContainer: (props: IColumnHeaderContainerProps) => JSX.Element;
}

/** The defaults for {@link IGridColumnHeaderContainerComponents}. */
export const ColumnHeaderContainerComponents: IGridColumnHeaderContainerComponents = {
    onRenderContainer: props => <ColumnHeaderUi.Container {...props} />,
};
