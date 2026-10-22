import { useMemo } from "react";
import { AddTaskButtonComponents, IAddTaskButtonComponents } from "./components";
import { getAddTaskButtonStyles } from "./styles";

export interface IAddTaskButtonProps {
    /** Its tooltip and accessible name. */
    label: string;
    onClick: () => void;
    components?: Partial<IAddTaskButtonComponents>;
}

/** The button that adds a subtask, shown on the row the user is on. */
export const AddTaskButton = (props: IAddTaskButtonProps) => {
    const styles = useMemo(() => getAddTaskButtonStyles(), []);
    const components = { ...AddTaskButtonComponents, ...props.components };
    return components.onRenderButton({
        className: styles.addTaskButton,
        title: props.label,
        ariaLabel: props.label,
        iconProps: { iconName: 'Add' },
        onClick: props.onClick,
    });
};
