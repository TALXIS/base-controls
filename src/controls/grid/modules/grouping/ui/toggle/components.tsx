import { IButtonProps, IconButton } from "@fluentui/react";

/** The chevron's props, with whether the group is open. */
export interface IGroupingUiToggleButtonProps extends IButtonProps {
    isExpanded: boolean;
}

/** The replaceable pieces of what opens and closes one group. */
export interface IGroupingUiToggleComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderButton: (props: IGroupingUiToggleButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IGroupingUiToggleComponents}. */
export const GroupingUiToggleComponents: IGroupingUiToggleComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderButton: ({ isExpanded, ...props }) => <IconButton {...props} />,
};
