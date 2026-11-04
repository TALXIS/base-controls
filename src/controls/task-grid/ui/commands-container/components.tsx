import { CellUiCommandsComponents, ICellUiCommandsComponents } from "../../../grid";

/** The replaceable pieces of the element a task's row commands are drawn in. */
export type ITaskGridUiCommandsContainerComponents = Pick<ICellUiCommandsComponents, 'onRenderContainer'>;

/** The defaults for {@link ITaskGridUiCommandsContainerComponents}. */
export const TaskGridUiCommandsContainerComponents: ITaskGridUiCommandsContainerComponents = {
    onRenderContainer: CellUiCommandsComponents.onRenderContainer,
};
