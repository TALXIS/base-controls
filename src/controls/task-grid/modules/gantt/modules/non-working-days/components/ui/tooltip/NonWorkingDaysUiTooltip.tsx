import { Fragment, useMemo } from "react";
import { DirectionalHint, useTheme } from "@fluentui/react";
import type { IGanttNonWorkingDay } from "../../../GanttNonWorkingDays";
import { INonWorkingDayTooltipComponents, NonWorkingDayTooltipComponents } from "./components";
import { getNonWorkingDayTooltipStyles } from "./styles";

export interface INonWorkingDayTooltipProps {
    /** The element the tooltip is drawn under, such as a scale cell. */
    target: HTMLElement;
    /** The days covering the target, each shown by its description. */
    days: IGanttNonWorkingDay<unknown>[];
    components?: Partial<INonWorkingDayTooltipComponents>;
}

/** The descriptions of the non-working days, one per line. */
export const NonWorkingDayTooltip = (props: INonWorkingDayTooltipProps) => {
    const components = { ...NonWorkingDayTooltipComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getNonWorkingDayTooltipStyles(theme), [theme]);

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
