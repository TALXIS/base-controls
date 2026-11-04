import { RibbonUiComponents } from "../../../ribbon";
import { DatasetControl, IDatasetControlRibbonProps } from "../../../dataset-control";
import { useTaskRuntime } from "../root/context";

/** Props for `TaskDatasetControl.Ribbon`. */
export type ITaskRibbonProps = IDatasetControlRibbonProps;

/** `DatasetControl.Ribbon`, its items passed through the task grid's ribbon command UI hooks. */
export const Ribbon = (props: ITaskRibbonProps) => {
    const runtime = useTaskRuntime();
    const components = { ...RibbonUiComponents, ...props.components };
    return <DatasetControl.Ribbon {...props} components={{ ...components, onRenderCommandBar: commandBarProps => components.onRenderCommandBar({ ...commandBarProps, items: runtime.getRibbonCommandItems(commandBarProps.items) }) }} />;
};
