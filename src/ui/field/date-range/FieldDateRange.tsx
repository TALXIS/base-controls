import { useTheme } from "@theme";
import { useMemo } from "react";

import { IFieldDateRangeComponents, FieldDateRangeComponents } from "./components";
import { getFieldDateRangeStyles } from "./styles";

export interface IFieldDateRangeProps {
    /** Such as `3 Feb – 18 Feb 2026`, or a single date. */
    range: string;
    duration?: string;
    components?: Partial<IFieldDateRangeComponents>;
}

/** When something runs, with how long it runs after it. */
export const FieldDateRange = (props: IFieldDateRangeProps) => {
    const components = { ...FieldDateRangeComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getFieldDateRangeStyles(theme), [theme]);

    return components.onRender({
        className: styles.dateRange,
        children: <>
            {components.onRenderIcon({ iconName: 'Calendar', className: styles.icon })}
            {components.onRenderRange({ className: styles.range, children: props.range })}
            {props.duration && components.onRenderDuration({ className: styles.duration, children: props.duration })}
        </>,
    });
};
