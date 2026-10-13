/** The replaceable pieces of the header. */
export interface IHeaderUiComponents {
    /** The box of the header. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IHeaderUiComponents}. */
export const HeaderUiComponents: IHeaderUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
