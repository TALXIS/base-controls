import { useTheme } from "@theme";
import { useMemo } from "react";

import { IRecordCardDateRangeComponents, RecordCardDateRangeComponents } from "./components";
import { getRecordCardDateRangeStyles } from "./styles";

export interface IRecordCardDateRangeProps {
    /** Such as `3 Feb – 18 Feb 2026`, or a single date. */
    range: string;
    duration?: string;
    components?: Partial<IRecordCardDateRangeComponents>;
}

/** When something runs, with how long it runs after it. */
export const RecordCardDateRange = (props: IRecordCardDateRangeProps) => {
    const components = { ...RecordCardDateRangeComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getRecordCardDateRangeStyles(theme), [theme]);

    return components.onRender({
        className: styles.dateRange,
        children: <>
            {components.onRenderIcon({ iconName: 'Calendar', className: styles.icon })}
            {components.onRenderRange({ className: styles.range, children: props.range })}
            {props.duration && components.onRenderDuration({ className: styles.duration, children: props.duration })}
        </>,
    });
};
