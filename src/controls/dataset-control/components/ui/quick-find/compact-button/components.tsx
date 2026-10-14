import { IButtonProps, IconButton } from "@fluentui/react";

/** The replaceable pieces of the quick find's compact button. */
export interface IQuickFindCompactButtonComponents {
    /** The button. */
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IQuickFindCompactButtonComponents}. */
export const QuickFindCompactButtonComponents: IQuickFindCompactButtonComponents = {
    onRenderButton: props => <IconButton {...props} />,
};
