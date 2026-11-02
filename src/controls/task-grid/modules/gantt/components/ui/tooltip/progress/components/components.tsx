/** The replaceable pieces of the progress bar. */
export interface ITooltipUiProgressComponents {
    /** Holds the track and the text. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTrack: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** Its width is the progress. */
    onRenderFill: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderText: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link ITooltipUiProgressComponents}. */
export const TooltipUiProgressComponents: ITooltipUiProgressComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderTrack: props => <div {...props} />,
    onRenderFill: props => <div {...props} />,
    onRenderText: props => <span {...props} />,
};
