import { CommandBarButton, IButtonProps } from "@fluentui/react";

/** The replaceable pieces of the page size switcher. */
export interface IDatasetControlUiPageSizeSwitcherComponents {
    /** The button; its `menuProps.items` are the page sizes. */
    onRender: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiPageSizeSwitcherComponents}. */
export const DatasetControlUiPageSizeSwitcherComponents: IDatasetControlUiPageSizeSwitcherComponents = {
    onRender: props => <CommandBarButton {...props} />,
};
