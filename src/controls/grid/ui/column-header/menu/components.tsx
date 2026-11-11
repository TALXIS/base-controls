import { IContextualMenuProps } from "@fluentui/react";
import { ContextualMenu } from "@ui";

/** The replaceable pieces of the menu a column header opens. */
export interface IColumnHeaderUiMenuComponents {
    onRender: (props: IContextualMenuProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiMenuComponents}. */
export const ColumnHeaderUiMenuComponents: IColumnHeaderUiMenuComponents = {
    onRender: props => <ContextualMenu {...props} />,
};
