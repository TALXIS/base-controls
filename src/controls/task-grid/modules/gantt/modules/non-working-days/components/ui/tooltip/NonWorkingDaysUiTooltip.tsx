import { Fragment, useMemo } from "react";
import { DirectionalHint, useTheme } from "@fluentui/react";
import { INonWorkingDaysUiTooltipComponents, INonWorkingDaysUiTooltipDay, NonWorkingDaysUiTooltipComponents } from "./components";
import { getNonWorkingDaysUiTooltipStyles } from "./styles";

export interface INonWorkingDaysUiTooltipProps {
    /** The element the tooltip is drawn under, such as a scale cell. */
    target: HTMLElement;
    /** The days covering the target, each shown by its description. */
    days: INonWorkingDaysUiTooltipDay[];
    components?: Partial<INonWorkingDaysUiTooltipComponents>;
}

/** The descriptions of the non-working days, one per line. */
export const NonWorkingDaysUiTooltip = (props: INonWorkingDaysUiTooltipProps) => {
    const components = { ...NonWorkingDaysUiTooltipComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getNonWorkingDaysUiTooltipStyles(theme), [theme]);

    return components.onRenderCallout({
        target: props.target,
        directionalHint: DirectionalHint.bottomCenter,
        isBeakVisible: false,
        gapSpace: 4,
        styles: { root: styles.callout, calloutMain: styles.calloutMain },
        children: components.onRenderContainer({
            className: styles.container,
            children: props.days.map(day => <Fragment key={day.id}>{components.onRenderDescription({ day, children: day.description })}</Fragment>),
        }),
    });
};
