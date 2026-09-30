import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of what a column header is drawn in. */
export interface IColumnHeaderUiContainerComponents {
    /** What the header is drawn in, and what opens its menu. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IColumnHeaderUiContainerComponents}. */
export const ColumnHeaderUiContainerComponents: IColumnHeaderUiContainerComponents = {
    onRenderButton: props => <CommandBarButton {...props} />,
};
