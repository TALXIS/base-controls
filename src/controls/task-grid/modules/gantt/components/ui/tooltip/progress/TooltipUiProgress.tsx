import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ITooltipUiProgressComponents, TooltipUiProgressComponents } from "./components";
import { getTooltipUiProgressStyles } from "./styles";

export interface ITooltipUiProgressProps {
    /** From 0 to 100. */
    percent: number;
    /** Such as `40%`. */
    text: string;
    /** The fill's colour, the theme's by default. */
    color?: string;
    components?: Partial<ITooltipUiProgressComponents>;
}

/** A bar filled to the progress, with the progress after it. */
export const TooltipUiProgress = (props: ITooltipUiProgressProps) => {
    const components = { ...TooltipUiProgressComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTooltipUiProgressStyles(theme), [theme]);
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
