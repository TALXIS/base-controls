import { RibbonUiCommandBarComponents } from "@controls/ribbon";
import { DatasetControl, IDatasetControlRibbonProps } from "@controls/dataset-control";
import { useTaskRuntime } from "../root/context";

/** Props for `TaskDatasetControl.Ribbon`. */
export type ITaskRibbonProps = IDatasetControlRibbonProps;

/** `DatasetControl.Ribbon`, its items passed through the task grid's ribbon command UI hooks. */
export const Ribbon = (props: ITaskRibbonProps) => {
    const runtime = useTaskRuntime();
    const commandBar = { ...RibbonUiCommandBarComponents, ...props.components?.commandBar };
    return <DatasetControl.Ribbon {...props} components={{ ...props.components, commandBar: { ...commandBar, onRender: commandBarProps => commandBar.onRender({ ...commandBarProps, items: runtime.getRibbonCommandItems(commandBarProps.items) }) } }} />;
};
