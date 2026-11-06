import { IButtonProps, IconButton } from "@fluentui/react";

/** The replaceable pieces of the quick find's compact button. */
export interface IDatasetControlUiQuickFindCompactButtonComponents {
    /** The button. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IDatasetControlUiQuickFindCompactButtonComponents}. */
export const DatasetControlUiQuickFindCompactButtonComponents: IDatasetControlUiQuickFindCompactButtonComponents = {
    onRenderButton: props => <IconButton {...props} />,
};
