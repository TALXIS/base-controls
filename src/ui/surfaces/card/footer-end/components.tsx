/** The replaceable pieces of the footer's end. */
export interface ICardFooterEndComponents {
    /** The footer's end. */
    onRender: (props: React.HTMLAttributes<HTMLDivElement>) => JSX.Element | null;
}

/** The defaults for {@link ICardFooterEndComponents}. */
export const CardFooterEndComponents: ICardFooterEndComponents = {
    onRender: props => <div {...props} />,
};
