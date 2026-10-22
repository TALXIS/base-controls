import { IButtonProps, IconButton } from "@fluentui/react";

/** The replaceable pieces of the button that adds a subtask. */
export interface IAddTaskButtonComponents {
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IAddTaskButtonComponents}. */
export const AddTaskButtonComponents: IAddTaskButtonComponents = {
    onRenderButton: props => <IconButton {...props} />,
};
