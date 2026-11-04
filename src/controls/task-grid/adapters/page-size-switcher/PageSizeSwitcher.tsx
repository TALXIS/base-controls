import { useEventEmitter, useRerender } from "@core";
import { DatasetControl, IPageSizeSwitcherProps, PageSizeSwitcherUiComponents } from "../../../dataset-control";
import type { ITaskDataProviderEvents } from "../../runtime/provider";
import { useTaskRuntime } from "../root/context";

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
