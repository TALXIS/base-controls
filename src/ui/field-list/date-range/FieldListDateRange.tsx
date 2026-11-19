import { useTheme } from "@theme";
import { useMemo } from "react";

import { IFieldListDateRangeComponents, FieldListDateRangeComponents } from "./components";
import { getFieldListDateRangeStyles } from "./styles";

export interface IFieldListDateRangeProps {
    /** Such as `3 Feb – 18 Feb 2026`, or a single date. */
    range: string;
    duration?: string;
    components?: Partial<IFieldListDateRangeComponents>;
}

/** When something runs, with how long it runs after it. */
export const FieldListDateRange = (props: IFieldListDateRangeProps) => {
    const components = { ...FieldListDateRangeComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getFieldListDateRangeStyles(theme), [theme]);

    return components.onRender({
        className: styles.dateRange,
        children: <>
            {components.onRenderIcon({ iconName: 'Calendar', className: styles.icon })}
            {components.onRenderRange({ className: styles.range, children: props.range })}
            {props.duration && components.onRenderDuration({ className: styles.duration, children: props.duration })}
        </>,
    });
};
