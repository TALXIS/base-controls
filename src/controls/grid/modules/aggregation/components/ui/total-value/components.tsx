/** The replaceable pieces of what a total reads as. */
export interface IAggregationUiTotalValueComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** What the total is of, drawn only when there is a label. */
    onRenderLabel: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    onRenderValue: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link IAggregationUiTotalValueComponents}. */
export const AggregationUiTotalValueComponents: IAggregationUiTotalValueComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderLabel: props => <span {...props} />,
    onRenderValue: props => <span {...props} />,
};
