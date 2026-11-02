import { ReactNode, useMemo } from "react";
import { DirectionalHint, IPoint, useTheme } from "@fluentui/react";
import { ITaskTooltipUiCalloutComponents, TaskTooltipUiCalloutComponents } from "./components";
import { getTaskTooltipUiCalloutStyles } from "./styles";

export interface ITaskTooltipUiCalloutProps {
    target: IPoint;
    children?: ReactNode;
    components?: Partial<ITaskTooltipUiCalloutComponents>;
}

/** The callout a tooltip is drawn in, next to a point. */
export const TaskTooltipUiCallout = (props: ITaskTooltipUiCalloutProps) => {
    const components = { ...TaskTooltipUiCalloutComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTaskTooltipUiCalloutStyles(theme), [theme]);

    return components.onRenderCallout({
        target: props.target,
        directionalHint: DirectionalHint.bottomLeftEdge,
        isBeakVisible: false,
        gapSpace: 8,
        styles: { root: styles.callout, calloutMain: styles.calloutMain },
        children: components.onRenderContainer({ className: styles.container, children: props.children }),
    });
};
