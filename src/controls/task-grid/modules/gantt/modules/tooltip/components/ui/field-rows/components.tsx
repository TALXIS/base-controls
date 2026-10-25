/** The replaceable pieces of the tooltip's field rows. */
export interface ITaskTooltipUiFieldRowsComponents {
    /** Holds the rows. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITaskTooltipUiFieldRowsComponents}. */
export const TaskTooltipUiFieldRowsComponents: ITaskTooltipUiFieldRowsComponents = {
    onRenderContainer: props => <div {...props} />,
};
