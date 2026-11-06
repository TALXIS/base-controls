import { useTheme } from "@theme";
import { useMemo } from "react";

import { IRecordCardProgressComponents, RecordCardProgressComponents } from "./components";
import { getRecordCardProgressStyles } from "./styles";

export interface IRecordCardProgressProps {
    /** From 0 to 100. */
    percent: number;
    /** Such as `40%`. */
    text: string;
    /** The fill's colour, the theme's by default. */
    color?: string;
    components?: Partial<IRecordCardProgressComponents>;
}

/** A bar filled to the progress, with the progress after it. */
export const RecordCardProgress = (props: IRecordCardProgressProps) => {
    const components = { ...RecordCardProgressComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getRecordCardProgressStyles(theme), [theme]);
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
