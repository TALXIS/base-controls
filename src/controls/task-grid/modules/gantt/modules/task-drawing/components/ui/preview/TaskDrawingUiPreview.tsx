import { useMemo } from "react";
import { DirectionalHint, IPoint, useTheme } from "@fluentui/react";
import { useApplicationTheme } from "@theme";
import { TaskDrawingUiPreviewComponents, ITaskDrawingUiPreviewComponents } from "./components";
import { getTaskDrawingUiPreviewStyles } from "./styles";

export interface ITaskDrawingUiPreviewProps {
    /** The row the task goes above, relative to the chart. */
    row?: { top: number; height: number };
    /** The span being drawn, relative to the chart. */
    span?: { left: number; width: number; height: number };
    /** What the callout says, such as the dates of the span. */
    text: string;
    /** Where the callout points: the pointer, or the span's end when there is a span. */
    target: IPoint;
    components?: Partial<ITaskDrawingUiPreviewComponents>;
}

/** What drawing a task shows: the row, the span drawn so far, and its dates. */
export const TaskDrawingUiPreview = (props: ITaskDrawingUiPreviewProps) => {
    const components = { ...TaskDrawingUiPreviewComponents, ...props.components };
    const theme = useTheme();
    const applicationTheme = useApplicationTheme();
    const styles = useMemo(() => getTaskDrawingUiPreviewStyles(theme, applicationTheme), [theme, applicationTheme]);

    return <>
        {props.row && components.onRenderRow({
            className: styles.row,
            style: { top: props.row.top, height: props.row.height },
            children: props.span && components.onRenderSpan({ className: styles.span, style: { left: props.span.left, width: props.span.width, height: props.span.height } }),
        })}
        {components.onRenderCallout({
            target: props.target,
            directionalHint: DirectionalHint.bottomLeftEdge,
            isBeakVisible: false,
            gapSpace: 8,
            children: components.onRenderText({ className: styles.text, children: props.text }),
        })}
    </>;
};
