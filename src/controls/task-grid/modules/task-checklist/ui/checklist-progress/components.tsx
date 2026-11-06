import { Icon, IIconProps, ITextProps, Text } from "@fluentui/react";

/** The replaceable pieces of {@link ChecklistProgress}. */
export interface ITaskChecklistUiProgressComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderIcon: (props: IIconProps) => JSX.Element | null;
    /** Such as `2/5`. */
    onRenderText: (props: ITextProps) => JSX.Element | null;
}

/** The defaults for {@link ITaskChecklistUiProgressComponents}. */
export const TaskChecklistUiProgressComponents: ITaskChecklistUiProgressComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderIcon: props => <Icon {...props} />,
    onRenderText: props => <Text {...props} />,
};
