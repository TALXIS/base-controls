import { ColumnHeaderUi, IColumnHeaderMenuProps } from "../ui";

/** The replaceable pieces of the menu a column header opens. */
export interface IGridColumnHeaderMenuComponents {
    /** The menu itself, handed what it offers. `ColumnHeaderUi.Menu` draws it by default, and `IColumnHeaderMenuProps` is what it takes. */
    onRenderMenu: (props: IColumnHeaderMenuProps) => JSX.Element | null;
}

/** The defaults for {@link IGridColumnHeaderMenuComponents}. */
export const ColumnHeaderMenuComponents: IGridColumnHeaderMenuComponents = {
    onRenderMenu: props => <ColumnHeaderUi.Menu {...props} />,
};
