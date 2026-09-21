import { ColumnHeaderUi, IColumnHeaderUiMenuProps } from "../ui";

/** The replaceable pieces of the menu a column header opens. */
export interface IColumnHeaderMenuComponents {
    /** The menu itself, handed what it offers. `ColumnHeaderUi.Menu` draws it by default, and `IColumnHeaderUiMenuProps` is what it takes. */
    onRenderMenu: (props: IColumnHeaderUiMenuProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderMenuComponents}. */
export const ColumnHeaderMenuComponents: IColumnHeaderMenuComponents = {
    onRenderMenu: props => <ColumnHeaderUi.Menu {...props} />,
};
