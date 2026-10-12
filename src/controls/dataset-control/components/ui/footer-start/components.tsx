/** The replaceable pieces of the footer's start region. */
export interface IFooterStartUiComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IFooterStartUiComponents}. */
export const FooterStartUiComponents: IFooterStartUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
