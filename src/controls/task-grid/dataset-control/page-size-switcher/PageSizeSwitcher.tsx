import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { IPageSizeSwitcherProps, PageSizeSwitcher as DatasetControlPageSizeSwitcher } from "@controls/dataset-control/components/adapters/page-size-switcher";
import { PageSizeSwitcherUiComponents } from "@controls/dataset-control/components/ui/page-size-switcher";
import type { ITaskDataProviderEvents } from "../../provider";
import { useTaskRuntime } from "../context";

/** Props for `TaskDatasetControl.PageSizeSwitcher`. */
export interface ITaskPageSizeSwitcherProps extends Omit<IPageSizeSwitcherProps, 'pageSizes'> { }

/** `DatasetControl.PageSizeSwitcher` showing the task count, always disabled. */
export const PageSizeSwitcher = (props: ITaskPageSizeSwitcherProps) => {
    const provider = useTaskRuntime().getProvider();
    const { rerender } = useRerender();
    //a created or deleted task changes the count without a new load
    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, 'onTreeChanged', rerender);
    const onRenderButton = props.components?.onRenderButton ?? PageSizeSwitcherUiComponents.onRenderButton;
    return <DatasetControlPageSizeSwitcher {...props} components={{ ...props.components, onRenderButton: buttonProps => onRenderButton({ ...buttonProps, disabled: true }) }} />;
};
