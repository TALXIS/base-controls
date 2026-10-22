import { RibbonUiComponents } from "@controls/ribbon";
import { IDatasetControlRibbonProps, Ribbon as DatasetControlRibbon } from "@controls/dataset-control/components/adapters/ribbon";
import { useTaskDatasetControl } from "../context";

/** Props for `TaskDatasetControl.Ribbon`; an `onRenderCommandBar` is handed the items the hooks changed. */
export type ITaskRibbonProps = IDatasetControlRibbonProps;

/** `DatasetControl.Ribbon`, its items passed through the task grid's ribbon command UI hooks. */
export const Ribbon = (props: ITaskRibbonProps) => {
    const runtime = useTaskDatasetControl();
    const components = { ...RibbonUiComponents, ...props.components };
    return <DatasetControlRibbon {...props} components={{ ...components, onRenderCommandBar: commandBarProps => components.onRenderCommandBar({ ...commandBarProps, items: runtime.getRibbonCommandItems(commandBarProps.items) }) }} />;
};
