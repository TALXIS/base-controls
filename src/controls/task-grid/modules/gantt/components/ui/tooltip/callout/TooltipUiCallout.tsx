import { ReactNode, useMemo } from "react";
import { DirectionalHint, IPoint } from "@fluentui/react";
import { useApplicationTheme } from "@theme";
import { ITooltipUiCalloutComponents, TooltipUiCalloutComponents } from "./components";
import { getTooltipUiCalloutStyles } from "./styles";

export interface ITooltipUiCalloutProps {
    target: IPoint;
    children?: ReactNode;
    components?: Partial<ITooltipUiCalloutComponents>;
}

/** The callout a tooltip is drawn in, next to a point. */
export const TooltipUiCallout = (props: ITooltipUiCalloutProps) => {
    const components = { ...TooltipUiCalloutComponents, ...props.components };
    const applicationTheme = useApplicationTheme();
    const styles = useMemo(() => getTooltipUiCalloutStyles(applicationTheme), [applicationTheme]);

    return components.onRenderCallout({
        target: props.target,
        directionalHint: DirectionalHint.bottomLeftEdge,
        isBeakVisible: false,
        gapSpace: 8,
        styles: { root: styles.callout, calloutMain: styles.calloutMain },
        children: components.onRenderContainer({ className: styles.container, children: props.children }),
    });
};
