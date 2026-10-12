import type { IGridComponents } from "@controls/grid";
import type { IDatasetControlComponents } from "@controls/dataset-control";
import { IRibbonUiComponents, RibbonUiComponents } from "@controls/ribbon";

/** The replaceable parts of the task grid: the DatasetControl's, the grid's and the command bar. */
export interface ITaskGridComponents extends IDatasetControlComponents, IGridComponents {
    /** The command bar in the header; its `items` are the task grid's commands. */
    onRenderCommandBar: IRibbonUiComponents['onRenderCommandBar'];
}

/** The defaults for {@link ITaskGridComponents}. */
export const TaskGridComponents: ITaskGridComponents = {
    onRenderCommandBar: RibbonUiComponents.onRenderCommandBar,
};
