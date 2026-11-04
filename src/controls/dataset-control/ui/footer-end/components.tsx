/** The replaceable pieces of the footer's end region. */
export interface IFooterEndUiComponents {
    /** The box of the footer's end region. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IFooterEndUiComponents}. */
export const FooterEndUiComponents: IFooterEndUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
