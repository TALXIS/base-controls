/** The replaceable pieces of the footer's start. */
export interface ICardFooterStartComponents {
    /** The footer's start. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardFooterStartComponents}. */
export const CardFooterStartComponents: ICardFooterStartComponents = {
    onRender: props => <div {...props} />,
};
