import { ReactNode, Ref, useMemo } from "react";
import { IStyle, useTheme } from "@fluentui/react";
import { GanttUiChartComponents, IGanttUiChartComponents } from "./components";
import { getGanttUiChartStyles } from "./styles";

export interface IGanttUiChartProps {
    chartRef: Ref<HTMLDivElement>;
    /** Merged onto the chart, after its own styles. */
    moduleStyles: IStyle[];
    /** Laid over the chart. */
    children?: ReactNode;
    components?: Partial<IGanttUiChartComponents>;
}

/** The area the chart is drawn into, themed for the library's own markup. */
export const GanttUiChart = (props: IGanttUiChartProps) => {
    const components = { ...GanttUiChartComponents, ...props.components };
    const theme = useTheme();
    const styles = useMemo(() => getGanttUiChartStyles(theme, props.moduleStyles), [theme, props.moduleStyles]);

    return components.onRenderContainer({
        className: styles.root,
        children: <>
            {components.onRenderChart({ ref: props.chartRef, className: styles.chart })}
            {props.children}
        </>,
    });
};
