/** The replaceable pieces of the tooltip's header. */
export interface ITaskTooltipUiHeaderComponents {
    /** Holds the title and the status. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
    onRenderTitle: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
    /** A pill with the status in its colour; drawn only with a status. */
    onRenderStatus: (props: React.HTMLAttributes<HTMLSpanElement>) => JSX.Element | null;
}

/** The defaults for {@link ITaskTooltipUiHeaderComponents}. */
export const TaskTooltipUiHeaderComponents: ITaskTooltipUiHeaderComponents = {
    onRenderContainer: props => <div {...props} />,
    onRenderTitle: props => <span {...props} />,
    onRenderStatus: props => <span {...props} />,
};
