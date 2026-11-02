import { useMemo } from "react";
import { useTheme } from "@fluentui/react";
import { ITaskTooltipUiDateRangeComponents, TaskTooltipUiDateRangeComponents } from "./components";
import { getTaskTooltipUiDateRangeStyles } from "./styles";

export interface ITaskTooltipUiDateRangeProps {
    /** Such as `3 Feb – 18 Feb 2026`, or a single date. */
    range: string;
    duration?: string;
    components?: Partial<ITaskTooltipUiDateRangeComponents>;
}

/** When something runs, with how long it runs after it. */
export const TaskTooltipUiDateRange = (props: ITaskTooltipUiDateRangeProps) => {
    const components = { ...TaskTooltipUiDateRangeComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getTaskTooltipUiDateRangeStyles(theme), [theme]);

    return components.onRenderContainer({
        className: styles.dateRange,
        children: <>
            {components.onRenderIcon({ iconName: 'Calendar', className: styles.icon })}
            {components.onRenderRange({ className: styles.range, children: props.range })}
            {props.duration && components.onRenderDuration({ className: styles.duration, children: props.duration })}
        </>,
    });
};
