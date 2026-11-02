import { useMemo } from "react";
import { ITaskGridUiPercentCompleteComponents, TaskGridUiPercentCompleteComponents } from "./components";
import { getTaskGridUiPercentCompleteStyles } from "./styles";

export interface ITaskGridUiPercentCompleteProps {
    /** From 0 to 100. */
    value: number;
    components?: Partial<ITaskGridUiPercentCompleteComponents>;
}

/** A bar filled to the value, with the value after it. */
export const TaskGridUiPercentComplete = (props: ITaskGridUiPercentCompleteProps) => {
    const components = { ...TaskGridUiPercentCompleteComponents, ...props.components };
    const styles = useMemo(() => getTaskGridUiPercentCompleteStyles(), []);
    return components.onRenderProgress({
        className: styles.progress,
        styles: { itemProgress: styles.itemProgress },
        barHeight: 5,
        percentComplete: props.value / 100,
        description: `${props.value}%`,
    });
};
