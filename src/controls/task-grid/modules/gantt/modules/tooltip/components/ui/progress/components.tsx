/** The replaceable pieces of the progress bar. */
export interface ITaskTooltipUiProgressComponents {
    /** Holds the track and the text. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTrack: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    /** Its width is the progress. */
    onRenderFill: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderText: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link ITaskTooltipUiProgressComponents}. */
export const TaskTooltipUiProgressComponents: ITaskTooltipUiProgressComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderTrack: props => <div {...props} />,
    onRenderFill: props => <div {...props} />,
    onRenderText: props => <span {...props} />,
};
