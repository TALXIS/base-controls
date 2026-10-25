import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ITaskTooltipUiProgressComponents, TaskTooltipUiProgressComponents } from "./components";
import { getTaskTooltipUiProgressStyles } from "./styles";

export interface ITaskTooltipUiProgressProps {
    /** From 0 to 100. */
    percent: number;
    /** Such as `40%`. */
    text: string;
    /** The fill's colour; the theme's without it. */
    color?: string;
    components?: Partial<ITaskTooltipUiProgressComponents>;
}

/** A bar filled to the progress, with the progress after it. */
export const TaskTooltipUiProgress = (props: ITaskTooltipUiProgressProps) => {
    const components = { ...TaskTooltipUiProgressComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTaskTooltipUiProgressStyles(theme), [theme]);
    const percent = Math.min(100, Math.max(0, props.percent));

    return components.onRenderContainer({
        className: styles.progress,
        children: <>
            {components.onRenderTrack({
                className: styles.track,
                children: components.onRenderFill({ className: styles.fill, style: { width: `${percent}%`, backgroundColor: props.color } }),
            })}
            {components.onRenderText({ className: styles.text, children: props.text })}
        </>,
    });
};
