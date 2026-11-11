import { CellUiCommandsComponents, ICellUiCommandsComponents } from "@controls/grid";

/** The replaceable pieces of the element a task's row commands are drawn in. */
export type ITaskGridUiCommandsContainerComponents = Pick<ICellUiCommandsComponents, 'onRender'>;

/** The defaults for {@link ITaskGridUiCommandsContainerComponents}. */
export const TaskGridUiCommandsContainerComponents: ITaskGridUiCommandsContainerComponents = {
    onRender: CellUiCommandsComponents.onRender,
};
