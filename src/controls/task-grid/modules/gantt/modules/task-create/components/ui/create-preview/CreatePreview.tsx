import { useMemo } from "react";
import { DirectionalHint, IPoint, useTheme } from "@fluentui/react";
import { Callout } from "@ui";
import { getCreatePreviewStyles } from "./styles";

export interface ICreatePreviewProps {
    /** The row the task goes above, relative to the chart. */
    row?: { top: number; height: number };
    /** The span being drawn, relative to the chart. */
    span?: { left: number; width: number; height: number };
    /** What the callout says, such as the dates of the span. */
    text: string;
    /** Where the callout points: the pointer, or the span's end when there is a span. */
    target: IPoint;
}

/** What drawing a task shows: the row, the span drawn so far, and its dates. */
export const CreatePreview = (props: ICreatePreviewProps) => {
    const theme = useTheme();
    const styles = useMemo(() => getCreatePreviewStyles(theme), [theme]);

    return <>
        {props.row && <div className={styles.row} style={{ top: props.row.top, height: props.row.height }}>
            {props.span && <div className={styles.span} style={{ left: props.span.left, width: props.span.width, height: props.span.height }} />}
        </div>}
        <Callout target={props.target} directionalHint={DirectionalHint.bottomLeftEdge} isBeakVisible={false} gapSpace={8}>
            <div className={styles.text}>{props.text}</div>
        </Callout>
    </>;
};
