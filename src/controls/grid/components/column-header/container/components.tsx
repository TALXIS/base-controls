import { ColumnHeaderUi, IColumnHeaderUiContainerProps } from "../ui";

/** The replaceable pieces of what a column header is drawn in. */
export interface IColumnHeaderContainerComponents {
    /** The element around what the header draws, `ColumnHeaderUi.Container` by default. */
    onRenderContainer: (props: IColumnHeaderUiContainerProps) => JSX.Element;
}

/** The defaults for {@link IColumnHeaderContainerComponents}. */
export const ColumnHeaderContainerComponents: IColumnHeaderContainerComponents = {
    onRenderContainer: props => <ColumnHeaderUi.Container {...props} />,
};
