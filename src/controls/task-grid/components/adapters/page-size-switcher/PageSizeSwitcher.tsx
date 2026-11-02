import { useEventEmitter } from "@hooks";
import { useRerender } from "@legacy";
import { DatasetControl, IPageSizeSwitcherProps, PageSizeSwitcherUiComponents } from "@controls/dataset-control";
import type { ITaskDataProviderEvents } from "../../../provider";
import { useTaskRuntime } from "../../../dataset-control/context";

/** Props for `TaskDatasetControl.PageSizeSwitcher`. */
export interface ITaskPageSizeSwitcherProps extends Omit<IPageSizeSwitcherProps, 'pageSizes'> { }

/** `DatasetControl.PageSizeSwitcher` showing the task count, always disabled. */
export const PageSizeSwitcher = (props: ITaskPageSizeSwitcherProps) => {
    const provider = useTaskRuntime().getProvider();
    const { rerender } = useRerender();
    //a created or deleted task changes the count without a new load
    useEventEmitter<ITaskDataProviderEvents>(provider.taskEvents, 'onTreeChanged', rerender);
    const onRenderButton = props.components?.onRenderButton ?? PageSizeSwitcherUiComponents.onRenderButton;
    return <DatasetControl.PageSizeSwitcher {...props} components={{ ...props.components, onRenderButton: buttonProps => onRenderButton({ ...buttonProps, disabled: true }) }} />;
};
