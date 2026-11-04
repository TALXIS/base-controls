import { IButtonProps, IconButton } from "@fluentui/react";

/** The replaceable pieces of what opens and closes the groups a level at a time. */
export interface IGroupingUiExpandCollapseComponents {
    /** What both buttons are drawn in. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderExpandButton: (props: IButtonProps) => JSX.Element | null;
    onRenderCollapseButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IGroupingUiExpandCollapseComponents}. */
export const GroupingUiExpandCollapseComponents: IGroupingUiExpandCollapseComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderExpandButton: props => <IconButton {...props} />,
    onRenderCollapseButton: props => <IconButton {...props} />,
};
