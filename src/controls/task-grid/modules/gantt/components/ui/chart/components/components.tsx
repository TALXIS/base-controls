/** The replaceable pieces of the Gantt's chart area. */
export interface IGanttUiChartComponents {
    /** Holds the chart and what is laid over it. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What the chart is drawn into, which must forward `ref`. */
    onRenderChart: (props: React.ComponentPropsWithRef<'div'>) => JSX.Element | null;
}

/** The defaults for {@link IGanttUiChartComponents}. */
export const GanttUiChartComponents: IGanttUiChartComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderChart: props => <div {...props} />,
};
