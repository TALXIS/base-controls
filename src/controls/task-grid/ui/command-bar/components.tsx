import { CellUiCommandsComponents, ICellUiCommandsComponents } from "@controls/grid";

/** The replaceable pieces of a task's row commands bar. */
export type ITaskGridUiCommandBarComponents = Pick<ICellUiCommandsComponents, 'onRenderCommandBar'>;

/** The defaults for {@link ITaskGridUiCommandBarComponents}. */
export const TaskGridUiCommandBarComponents: ITaskGridUiCommandBarComponents = {
    onRenderCommandBar: CellUiCommandsComponents.onRenderCommandBar,
};
