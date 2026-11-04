/** The replaceable pieces of the container. */
export interface IContainerUiComponents {
    /** The control's outer box. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IContainerUiComponents}. */
export const ContainerUiComponents: IContainerUiComponents = {
    onRenderContainer: props => <div {...props} />,
};
