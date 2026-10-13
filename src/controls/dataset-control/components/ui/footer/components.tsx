/** The replaceable pieces of the footer. */
export interface IFooterUiComponents {
    /** The box of the footer. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IFooterUiComponents}. */
export const FooterUiComponents: IFooterUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
