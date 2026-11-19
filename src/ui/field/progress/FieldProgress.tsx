import { useTheme } from "@theme";
import { useMemo } from "react";

import { IFieldProgressComponents, FieldProgressComponents } from "./components";
import { getFieldProgressStyles } from "./styles";

export interface IFieldProgressProps {
    /** From 0 to 100. */
    percent: number;
    /** Such as `40%`. */
    text: string;
    /** The fill's colour, the theme's by default. */
    color?: string;
    components?: Partial<IFieldProgressComponents>;
}

/** A bar filled to the progress, with the progress after it. */
export const FieldProgress = (props: IFieldProgressProps) => {
    const components = { ...FieldProgressComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getFieldProgressStyles(theme), [theme]);
    const percent = Math.min(100, Math.max(0, props.percent));

    return components.onRender({
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
