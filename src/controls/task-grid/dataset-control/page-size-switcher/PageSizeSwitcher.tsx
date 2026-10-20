import { IPageSizeSwitcherProps, PageSizeSwitcher as DatasetControlPageSizeSwitcher } from "@controls/dataset-control/components/adapters/page-size-switcher";
import { PageSizeSwitcherUiComponents } from "@controls/dataset-control/components/ui/page-size-switcher";

/** Props for `TaskDatasetControl.PageSizeSwitcher`. */
export interface ITaskPageSizeSwitcherProps extends Omit<IPageSizeSwitcherProps, 'pageSizes'> { }

/** `DatasetControl.PageSizeSwitcher` showing the task count, always disabled. */
export const PageSizeSwitcher = (props: ITaskPageSizeSwitcherProps) => {
    const onRenderButton = props.components?.onRenderButton ?? PageSizeSwitcherUiComponents.onRenderButton;
    return <DatasetControlPageSizeSwitcher {...props} components={{ ...props.components, onRenderButton: buttonProps => onRenderButton({ ...buttonProps, disabled: true }) }} />;
};
