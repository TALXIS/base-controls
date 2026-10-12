/** The replaceable pieces of the header's end region. */
export interface IHeaderEndUiComponents {
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IHeaderEndUiComponents}. */
export const HeaderEndUiComponents: IHeaderEndUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
