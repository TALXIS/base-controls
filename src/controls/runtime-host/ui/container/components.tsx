/** The replaceable pieces of the runtime's box. */
export interface IRuntimeHostUiContainerComponents {
    /** The box the runtime is drawn in. */
    onRenderContainer: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link IRuntimeHostUiContainerComponents}. */
export const RuntimeHostUiContainerComponents: IRuntimeHostUiContainerComponents = {
    onRenderContainer: props => <div {...props} />,
};
