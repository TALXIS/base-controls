import { ReactNode, useMemo } from "react";
import { ITaskTooltipUiFieldRowsComponents, TaskTooltipUiFieldRowsComponents } from "./components";
import { getTaskTooltipUiFieldRowsStyles } from "./styles";

export interface ITaskTooltipUiFieldRowsProps {
    children?: ReactNode;
    components?: Partial<ITaskTooltipUiFieldRowsComponents>;
}

/** The field rows, one under another. */
export const TaskTooltipUiFieldRows = (props: ITaskTooltipUiFieldRowsProps) => {
    const components = { ...TaskTooltipUiFieldRowsComponents, ...props.components };
    const styles = useMemo(() => getTaskTooltipUiFieldRowsStyles(), []);

    return components.onRenderContainer({ className: styles.fieldRows, children: props.children });
};
