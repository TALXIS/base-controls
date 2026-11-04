/** The replaceable pieces of the header's start region. */
export interface IHeaderStartUiComponents {
    /** The box of the header's start region. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IHeaderStartUiComponents}. */
export const HeaderStartUiComponents: IHeaderStartUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
