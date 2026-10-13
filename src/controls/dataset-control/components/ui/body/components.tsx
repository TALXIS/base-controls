/** The replaceable pieces of the body. */
export interface IBodyUiComponents {
    /** The box of the body. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IBodyUiComponents}. */
export const BodyUiComponents: IBodyUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
