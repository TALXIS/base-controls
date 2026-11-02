import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ITooltipUiDateRangeComponents, TooltipUiDateRangeComponents } from "./components";
import { getTooltipUiDateRangeStyles } from "./styles";

export interface ITooltipUiDateRangeProps {
    /** Such as `3 Feb – 18 Feb 2026`, or a single date. */
    range: string;
    duration?: string;
    components?: Partial<ITooltipUiDateRangeComponents>;
}

/** When something runs, with how long it runs after it. */
export const TooltipUiDateRange = (props: ITooltipUiDateRangeProps) => {
    const components = { ...TooltipUiDateRangeComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTooltipUiDateRangeStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.dateRange,
        children: <>
            {components.onRenderIcon({ iconName: 'Calendar', className: styles.icon })}
            {components.onRenderRange({ className: styles.range, children: props.range })}
            {props.duration && components.onRenderDuration({ className: styles.duration, children: props.duration })}
        </>,
    });
};
