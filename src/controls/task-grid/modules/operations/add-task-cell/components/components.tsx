import { IButtonProps, IconButton } from "@fluentui/react";
import type { ICellUiContainerComponents } from "@controls/grid";

/** The replaceable pieces of the button that adds a subtask. */
export interface IAddTaskButtonComponents {
    onRenderButton: (props: IButtonProps) => JSX.Element | null;
}

/** The defaults for {@link IAddTaskButtonComponents}. */
export const AddTaskButtonComponents: IAddTaskButtonComponents = {
    onRenderButton: props => <IconButton {...props} />,
};

/** The replaceable pieces of the add-task cell, by the part they belong to. */
export interface IAddTaskCellComponents {
    /** The element the button is drawn in. */
    container?: Partial<ICellUiContainerComponents>;
    button?: Partial<IAddTaskButtonComponents>;
}
