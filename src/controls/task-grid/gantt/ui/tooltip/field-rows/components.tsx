/** The replaceable pieces of the tooltip's field rows. */
export interface ITooltipUiFieldRowsComponents {
    /** Holds the rows. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ITooltipUiFieldRowsComponents}. */
export const TooltipUiFieldRowsComponents: ITooltipUiFieldRowsComponents = {
    onRenderContainer: props => <div {...props} />,
};
