import { useMemo } from "react";
import { ITaskGridUiTreeCellIndentComponents, TaskGridUiTreeCellIndentComponents } from "./components";
import { getTaskGridUiTreeCellIndentStyles } from "./styles";

export interface ITaskGridUiTreeCellIndentProps {
    /** How deep in the tree the task is. */
    level: number;
    /** Whether the chevron follows the indent. */
    hasToggle: boolean;
    components?: Partial<ITaskGridUiTreeCellIndentComponents>;
}

/** The room before a task's subject that shows how deep in the tree it is. */
export const TaskGridUiTreeCellIndent = (props: ITaskGridUiTreeCellIndentProps) => {
    const components = { ...TaskGridUiTreeCellIndentComponents, ...props.components };
    const styles = useMemo(() => getTaskGridUiTreeCellIndentStyles(props.level, props.hasToggle), [props.level, props.hasToggle]);
    return components.onRenderIndent({ className: styles.indent });
};
